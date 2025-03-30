import os
import sys
from pathlib import Path
import psycopg2
from psycopg2.extras import execute_values

# Add the api directory to the Python path
api_dir = str(Path(__file__).resolve().parent.parent)
if api_dir not in sys.path:
    sys.path.append(api_dir)

from db import DATABASE_URL

def seed_tickers():
    """Seed tickers data from the tickers.csv file."""
    # Connect directly with psycopg2
    conn = psycopg2.connect(DATABASE_URL)
    cur = conn.cursor()
    
    try:
        # Read tickers.csv
        csv_path = Path(__file__).parent / "tickers.csv"
        if not csv_path.exists():
            print(f"Error: {csv_path} not found")
            return
            
        print(f"Reading tickers from {csv_path}...")
        with open(csv_path, 'r') as f:
            # Skip header
            next(f)
            
            # Prepare values for bulk insert
            values = []
            for line in f:
                ticker, name, cik = line.strip().split(',')
                values.append((ticker, name, cik))
        
        # Insert tickers using execute_values
        insert_query = """
            INSERT INTO tickers (ticker, name, cik, created_at, updated_at)
            VALUES %s
            ON CONFLICT (cik) DO UPDATE SET
                ticker = EXCLUDED.ticker,
                name = EXCLUDED.name,
                updated_at = NOW()
        """
        
        print(f"Inserting {len(values)} tickers...")
        execute_values(cur, insert_query, values, page_size=1000)
        
        conn.commit()
        print("Successfully seeded tickers")
        
    except Exception as e:
        conn.rollback()
        print(f"Error seeding tickers: {e}")
    finally:
        cur.close()
        conn.close()

if __name__ == "__main__":
    seed_tickers() 