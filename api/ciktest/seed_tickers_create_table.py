import psycopg2
from urllib.parse import urlparse

# Basic connection test (use your actual Coolify DB connection string)
db_url = ""
parsed = urlparse(db_url)

print("Connecting to DB...")
conn = psycopg2.connect(
    dbname=parsed.path[1:],
    user=parsed.username,
    password=parsed.password,
    host=parsed.hostname,
    port=parsed.port
)
print("Connected ✅")

cur = conn.cursor()
print("Creating table...")
cur.execute("""
    CREATE TABLE IF NOT EXISTS tickers (
        cik TEXT PRIMARY KEY,
        company_name TEXT,
        ticker TEXT
    );
""")
conn.commit()
cur.close()
conn.close()
print("Table created ✅")
