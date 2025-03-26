import os
import tempfile
import itertools
import zipfile
import requests
from datetime import datetime
from urllib.parse import urlparse
import psycopg2
from psycopg2.extras import execute_values
from retry import requests_retry_session
from config import USER_AGENT, DATABASE_URL
from fastapi import HTTPException

BASE_URL = "https://www.sec.gov/Archives/edgar/full-index"


def update_tickers_data(testing: bool):
    if testing:
        return {"status": "success", "message": "Test mode: ticker update skipped."}

    try:
        response = requests.get(
            "https://www.sec.gov/files/company_tickers.json",
            headers={"User-agent": USER_AGENT},
            timeout=10
        )
        response.raise_for_status()
        data = response.json()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Fetch failed: {str(e)}")

    sec_data = {
        str(entry['cik_str']): {
            "company_name": entry.get("title"),
            "ticker": entry.get("ticker")
        } for entry in data.values()
    }

    try:
        parsed = urlparse(DATABASE_URL)
        conn = psycopg2.connect(
            dbname=parsed.path[1:],
            user=parsed.username,
            password=parsed.password,
            host=parsed.hostname,
            port=parsed.port
        )
        cur = conn.cursor()

        for cik, info in sec_data.items():
            cur.execute("""
                INSERT INTO tickers (cik, company_name, ticker)
                VALUES (%s, %s, %s)
                ON CONFLICT (cik) DO UPDATE
                SET company_name = EXCLUDED.company_name,
                    ticker = EXCLUDED.ticker;
            """, (cik, info["company_name"], info["ticker"]))

        conn.commit()
        cur.close()
        conn.close()

        return {"status": "success", "tickers_updated": len(sec_data)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


def update_edgar_filings_data(testing: bool):
    if testing:
        return {"status": "success", "message": "Test mode: filing update skipped."}

    parsed = urlparse(DATABASE_URL)
    conn = psycopg2.connect(
        dbname=parsed.path[1:],
        user=parsed.username,
        password=parsed.password,
        host=parsed.hostname,
        port=parsed.port
    )
    cur = conn.cursor()

    now = datetime.utcnow()
    year = now.year
    quarter = (now.month - 1) // 3 + 1
    quarter_key = f"{year}_QTR{quarter}"

    url = f"{BASE_URL}/{year}/QTR{quarter}/master.zip"

    try:
        with tempfile.TemporaryFile(mode="w+b") as tmp:
            retries_exceeded = True
            for _ in range(5):
                session = requests.Session()
                req = requests_retry_session(
                    retries=5, backoff_factor=0.2, session=session
                ).get(url=url, headers={"User-agent": USER_AGENT})

                if "will be managed until action is taken to declare your traffic." not in req.text:
                    retries_exceeded = False
                    break

            if retries_exceeded:
                return {"status": "error", "message": f"Retries exceeded for {url}"}

            tmp.write(req.content)
            tmp.seek(0)

            with zipfile.ZipFile(tmp).open("master.idx") as f:
                lines = [
                    line.decode("latin-1")
                    for line in itertools.islice(f, 11, None)
                ]
                entries = [line.strip().split("|") for line in lines if len(line.strip().split("|")) == 5]

        data = [
            (cik, company_name, form_type, date_filed, txt_filename, quarter_key)
            for cik, company_name, form_type, date_filed, txt_filename in entries
        ]

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

        return {
            "status": "success",
            "filings_processed": len(data),
            "quarter": quarter_key,
            "timestamp": now.isoformat()
        }

    except Exception as e:
        return {"status": "error", "message": f"Download or processing failed: {str(e)}"}
