from urllib.parse import urlparse
from dotenv import load_dotenv
from datetime import datetime
from requests.adapters import HTTPAdapter
from urllib3.util import Retry
from psycopg2.extras import execute_values
from tqdm import tqdm
import os
import psycopg2
import tempfile
import zipfile
import requests
import itertools

load_dotenv()

DB_URL = os.getenv("DATABASE_URL")
USER_AGENT = os.getenv("USER_AGENT")


def main():
    parsed = urlparse(DB_URL)

    print(f"💾 Connecting to database: {parsed.hostname}:{parsed.port}/{parsed.path[1:]}")
    try:
        conn = psycopg2.connect(
            dbname=parsed.path[1:],
            user=parsed.username,
            password=parsed.password,
            host=parsed.hostname,
            port=parsed.port
        )
    except Exception as e:
        raise RuntimeError(f"Database connection failed: {str(e)}")

    cur = conn.cursor()

    now = datetime.utcnow()
    year = now.year
    quarter = (now.month - 1) // 3 + 1
    quarter_key = f"{year}_QTR{quarter}"

    url = f"https://www.sec.gov/Archives/edgar/full-index/{year}/QTR{quarter}/master.zip"
    print(f"🌐 Downloading SEC data from: {url}")

    try:
        with tempfile.TemporaryFile(mode="w+b") as tmp:
            retries_exceeded = True
            for attempt in range(5):
                print(f"🔁 Attempt {attempt + 1} to download...")
                session = requests.Session()
                req = requests_retry_session(
                    retries=5, backoff_factor=0.2, session=session
                ).get(url=url, headers={"User-agent": USER_AGENT})

                if "will be managed until action is taken to declare your traffic." not in req.text:
                    retries_exceeded = False
                    break

            if retries_exceeded:
                print("❌ Failed to download after 5 attempts.")
                return {"status": "error", "message": f"Retries exceeded for {url}"}

            tmp.write(req.content)
            tmp.seek(0)

            print("📦 Extracting zip file...")
            with zipfile.ZipFile(tmp).open("master.idx") as f:
                lines = [
                    line.decode("latin-1")
                    for line in itertools.islice(f, 11, None)
                ]
                entries = [line.strip().split("|") for line in lines if len(line.strip().split("|")) == 5]

        print(f"🔍 Parsed {len(entries)} entries from master.idx")

        # Prepare data for bulk insert
        data = [
            (cik, company_name, form_type, date_filed, txt_filename, quarter_key)
            for cik, company_name, form_type, date_filed, txt_filename in tqdm(entries, desc="🧹 Preparing data")
        ]

        print("🚀 Inserting into database...")
        execute_values(
            cur,
            """
            INSERT INTO edgar_filings (cik, company_name, form_type, date_filed, txt_filename, quarter)
            VALUES %s
            ON CONFLICT (txt_filename) DO NOTHING
            """,
            data
        )

        conn.commit()
        cur.close()
        conn.close()

        print(f"✅ Success. Quarter: {quarter_key}. Filings inserted: {len(data)}. Timestamp: {now.isoformat()}")

    except Exception as e:
        raise e


def requests_retry_session(
        retries: int = 5,
        backoff_factor: float = 0.5,
        status_forcelist: tuple = (400, 401, 403, 500, 502, 503, 504, 505),
        session: requests.Session = None,
) -> requests.Session:
    session = session or requests.Session()

    retry = Retry(
        total=retries,
        read=retries,
        connect=retries,
        backoff_factor=backoff_factor,
        status_forcelist=status_forcelist,
    )

    adapter = HTTPAdapter(max_retries=retry)
    session.mount("http://", adapter)
    session.mount("https://", adapter)

    return session


if __name__ == "__main__":
    main()
