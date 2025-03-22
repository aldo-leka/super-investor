import os
import requests
import psycopg2
from urllib.parse import urlparse

# ENV vars
db_url = os.getenv("DATABASE_URL")
user_agent = os.getenv("USER_AGENT")

if not db_url or not user_agent:
    raise RuntimeError("Missing DATABASE_URL or USER_AGENT env vars.")

# Fetch SEC data
try:
    response = requests.get(
        "https://www.sec.gov/files/company_tickers.json",
        headers={"User-agent": user_agent},
        timeout=10
    )
    response.raise_for_status()
    data = response.json()
except Exception as e:
    print(f"[FETCH ERROR] {type(e).__name__}: {str(e)}")
    raise

# Parse SEC data
sec_data = {
    str(entry['cik_str']): {
        "company_name": entry.get("title"),
        "ticker": entry.get("ticker")
    }
    for entry in data.values()
}

# Connect to PostgreSQL
try:
    parsed = urlparse(db_url)
    conn = psycopg2.connect(
        dbname=parsed.path[1:],
        user=parsed.username,
        password=parsed.password,
        host=parsed.hostname,
        port=parsed.port
    )
    cur = conn.cursor()
except Exception as e:
    print(f"[DB CONNECT ERROR] {type(e).__name__}: {str(e)}")
    raise

# Insert/update records
inserted = 0
try:
    for cik, info in sec_data.items():
        cur.execute("""
            INSERT INTO tickers (cik, company_name, ticker)
            VALUES (%s, %s, %s)
            ON CONFLICT (cik) DO UPDATE
            SET company_name = EXCLUDED.company_name,
                ticker = EXCLUDED.ticker;
        """, (cik, info["company_name"], info["ticker"]))
        inserted += 1
    conn.commit()
    print(f"[SUCCESS] {inserted} tickers inserted/updated.")
except Exception as e:
    print(f"[DB INSERT ERROR] {type(e).__name__}: {str(e)}")
    conn.rollback()
    raise
finally:
    cur.close()
    conn.close()
    
