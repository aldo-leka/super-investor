import json
import psycopg2
from urllib.parse import urlparse

# Load data from your two local JSON files
with open('companies_info.json') as f1, open('company_tickers.json') as f2:
    data1 = json.load(f1)
    data2 = json.load(f2)

# Parse data
first = {cik: details['Company Name'] for cik, details in data1.items()}
second = {str(entry['cik_str']): (entry.get('title'), entry.get('ticker')) for entry in data2.values()}

combined = {}
for cik, name in first.items():
    company_name, ticker = second.get(cik, (name, None))
    combined[cik] = {"company_name": company_name or name, "ticker": ticker}
for cik, (name, ticker) in second.items():
    if cik not in combined:
        combined[cik] = {"company_name": name, "ticker": ticker}

# Connect using Coolify connection string
db_url = ""
parsed = urlparse(db_url)

conn = psycopg2.connect(
    dbname=parsed.path[1:],
    user=parsed.username,
    password=parsed.password,
    host=parsed.hostname,
    port=parsed.port
)

cur = conn.cursor()
cur.execute("""
    CREATE TABLE IF NOT EXISTS tickers (
        cik TEXT PRIMARY KEY,
        company_name TEXT,
        ticker TEXT
    );
""")

for cik, info in combined.items():
    cur.execute("""
        INSERT INTO tickers (cik, company_name, ticker)
        VALUES (%s, %s, %s)
        ON CONFLICT (cik) DO UPDATE
        SET company_name = EXCLUDED.company_name,
            ticker = EXCLUDED.ticker;
    """, (cik, info['company_name'], info['ticker']))

conn.commit()
cur.close()
conn.close()
print("Seeded DB.")
