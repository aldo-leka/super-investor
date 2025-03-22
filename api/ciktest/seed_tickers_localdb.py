import json
import psycopg2

# Load the files
with open('companies_info.json', 'r') as f1:
    data1 = json.load(f1)

with open('company_tickers.json', 'r') as f2:
    data2 = json.load(f2)

# Parse entries
ciks_from_first = {cik: details['Company Name'] for cik, details in data1.items()}
ciks_from_second = {str(entry['cik_str']): (entry.get('title'), entry.get('ticker')) for entry in data2.values()}

# Merge into unique CIKs
combined = {}
for cik, name in ciks_from_first.items():
    company_name, ticker = ciks_from_second.get(cik, (name, None))
    combined[cik] = {
        "company_name": company_name or name,
        "ticker": ticker
    }

for cik, (name, ticker) in ciks_from_second.items():
    if cik not in combined:
        combined[cik] = {
            "company_name": name,
            "ticker": ticker
        }

# Connect to PostgreSQL
conn = psycopg2.connect(
    dbname="super_investor",
    user="super_investor_user",
    password="SuperInvestorPwd",
    host="localhost",
    port="5432"
)
cur = conn.cursor()

# Insert or update each record
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

print(f"Inserted or updated {len(combined)} tickers.")
