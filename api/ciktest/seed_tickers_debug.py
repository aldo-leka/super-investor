import json
import psycopg2
from urllib.parse import urlparse

# Load your two JSON files
with open('companies_info.json') as f1, open('company_tickers.json') as f2:
    data1 = json.load(f1)
    data2 = json.load(f2)

# Merge both datasets
first = {cik: details['Company Name'] for cik, details in data1.items()}
second = {str(entry['cik_str']): (entry.get('title'), entry.get('ticker')) for entry in data2.values()}

combined = {}
for cik, name in first.items():
    company_name, ticker = second.get(cik, (name, None))
    combined[cik] = {"company_name": company_name or name, "ticker": ticker}
for cik, (name, ticker) in second.items():
    if cik not in combined:
        combined[cik] = {"company_name": name, "ticker": ticker}

print(f"🔍 Total combined entries: {len(combined)}")

# Connect to PostgreSQL (Coolify DB connection string)
db_url = ""
parsed = urlparse(db_url)

print("🔌 Connecting to database...")
conn = psycopg2.connect(
    dbname=parsed.path[1:],
    user=parsed.username,
    password=parsed.password,
    host=parsed.hostname,
    port=parsed.port
)
conn.set_session(autocommit=False)
cur = conn.cursor()
print("✅ Connected.")

# Insert rows with debug logs
batch_size = 500
batch = []
counter = 0

for i, (cik, info) in enumerate(combined.items(), 1):
    batch.append((cik, info['company_name'], info['ticker']))

    if i % batch_size == 0 or i == len(combined):
        for row in batch:
            cur.execute("""
                INSERT INTO tickers (cik, company_name, ticker)
                VALUES (%s, %s, %s)
                ON CONFLICT (cik) DO UPDATE
                SET company_name = EXCLUDED.company_name,
                    ticker = EXCLUDED.ticker;
            """, row)
        conn.commit()
        counter += len(batch)
        print(f"✅ Inserted {counter}/{len(combined)} rows...")
        batch.clear()

cur.close()
conn.close()
print("🎉 All data inserted.")
