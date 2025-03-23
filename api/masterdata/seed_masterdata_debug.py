import os
import psycopg2
import itertools
from urllib.parse import urlparse
from psycopg2.extras import execute_values
from tqdm import tqdm
from dotenv import load_dotenv

load_dotenv()

MASTER_DIR = "masterdatadownload"
db_url = os.getenv("DATABASE_URL")

if not db_url:
    raise RuntimeError("Missing DATABASE_URL env var.")

def parse_master_idx(file_path):
    with open(file_path, "rb") as f:
        lines = [
            line.decode("latin-1").strip()
            for line in itertools.islice(f, 11, None)  # start after dashed line
            if "|" in line.decode("latin-1")
        ]
        results = []
        for line in lines:
            cik, name, form, date, txt = line.split("|")
            results.append((cik, name, form, date, txt))
        return results

def connect_db():
    parsed = urlparse(db_url)
    conn = psycopg2.connect(
        dbname=parsed.path[1:],
        user=parsed.username,
        password=parsed.password,
        host=parsed.hostname,
        port=parsed.port
    )
    return conn

def create_table_if_not_exists(conn):
    with conn.cursor() as cur:
        cur.execute("""
            CREATE TABLE IF NOT EXISTS edgar_filings (
                id SERIAL PRIMARY KEY,
                cik TEXT,
                company_name TEXT,
                form_type TEXT,
                date_filed DATE,
                txt_filename TEXT UNIQUE,
                quarter TEXT
            );
        """)
    conn.commit()

def quarter_already_seeded(cur, quarter):
    cur.execute("""
        SELECT COUNT(*) FROM edgar_filings
        WHERE quarter = %s;
    """, (quarter,))
    count = cur.fetchone()[0]
    return count > 0

def seed_to_db():
    conn = connect_db()
    create_table_if_not_exists(conn)
    cur = conn.cursor()

    BATCH_SIZE = 1000  # Safe starting point for your VPS

    folders = sorted(os.listdir(MASTER_DIR))
    for folder in folders:
        folder_path = os.path.join(MASTER_DIR, folder)
        if not os.path.isdir(folder_path):
            continue

        idx_file = os.path.join(folder_path, "master.idx")
        if not os.path.exists(idx_file):
            print(f"⚠️  Skipping {folder} (no master.idx)")
            continue

        quarter = folder  # e.g., "1993_QTR1"
        if quarter_already_seeded(cur, quarter):
            print(f"⏭️  Skipping {quarter} (already seeded)")
            continue

        filings = parse_master_idx(idx_file)
        print(f"📄 Seeding {quarter} with {len(filings)} filings...")

        for i in tqdm(range(0, len(filings), BATCH_SIZE), desc=f"Inserting {quarter}"):
            batch = filings[i:i+BATCH_SIZE]
            values = [(cik, name, form, date, txt, quarter) for cik, name, form, date, txt in batch]

            try:
                execute_values(cur, """
                    INSERT INTO edgar_filings (cik, company_name, form_type, date_filed, txt_filename, quarter)
                    VALUES %s
                    ON CONFLICT (txt_filename) DO NOTHING;
                """, values)
            except Exception as e:
                print(f"❌ Batch insert error in {quarter} (batch {i}-{i+len(batch)}): {e}")

        conn.commit()
        print(f"✅ Finished seeding {quarter}")

    cur.close()
    conn.close()
    print("🎉 All done!")

if __name__ == "__main__":
    seed_to_db()
