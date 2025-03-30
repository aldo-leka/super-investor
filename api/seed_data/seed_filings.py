import os
import itertools
from datetime import datetime
from tqdm import tqdm
from sqlalchemy import text
from sqlalchemy.orm import Session
import sys
from pathlib import Path
import psycopg2
from psycopg2.extras import execute_values

# Add the api directory to the Python path
api_dir = str(Path(__file__).resolve().parent.parent)
if api_dir not in sys.path:
    sys.path.append(api_dir)

from config import DATABASE_URL
from db import engine, get_db

def parse_master_idx(file_path):
    """Parse master index file and return list of (cik, name, form, date, txt) tuples."""
    with open(file_path, "rb") as f:
        lines = [
            line.decode("latin-1").strip()
            for line in itertools.islice(f, 11, None)  # start after dashed line
            if "|" in line.decode("latin-1")
        ]
        results = []
        for line in lines:
            cik, name, form, date, txt = line.split("|")
            results.append((cik.strip(), name.strip(), form.strip(), date.strip(), txt.strip()))
        return results

def insert_filing_batch(filing_data: list, batch_size: int = 10000):
    """Insert a batch of filings using psycopg2.extras.execute_values."""
    # Connect directly with psycopg2
    conn = psycopg2.connect(DATABASE_URL)
    cur = conn.cursor()
    
    try:
        # Convert filing_data dict list to tuple list for execute_values
        values = [
            (data['cik'], data['filing_type'], data['filing_date'], data['filing_url'])
            for data in filing_data
        ]
        
        # Insert directly into filings table with a JOIN
        insert_query = """
            INSERT INTO filings (ticker_id, filing_type, filing_date, filing_url, created_at, updated_at)
            SELECT t.id, v.filing_type, v.filing_date, v.filing_url, NOW(), NOW()
            FROM tickers t
            JOIN (VALUES %s) AS v(cik, filing_type, filing_date, filing_url)
                ON t.cik = v.cik
        """
        
        print(f"Inserting {len(values)} records...")
        execute_values(cur, insert_query, values, page_size=batch_size)
        
        conn.commit()
        print(f"Successfully processed batch")
        
    except Exception as e:
        conn.rollback()
        print(f"Error inserting batch: {e}")
    finally:
        cur.close()
        conn.close()

def seed_filings():
    """Seed filings data from master index files."""
    print("Starting filings seeding process...")
    
    # Get all quarter folders
    base_path = os.path.join(os.path.dirname(__file__), "masterdatadownload")
    quarter_folders = sorted([
        f for f in os.listdir(base_path) 
        if os.path.isdir(os.path.join(base_path, f))
    ])

    try:
        for quarter in tqdm(quarter_folders, desc="Processing quarters"):
            idx_file = os.path.join(base_path, quarter, "master.idx")
            if not os.path.exists(idx_file):
                print(f"Skipping {quarter} - no master.idx file found")
                continue

            print(f"\nProcessing {quarter}...")
            filings = parse_master_idx(idx_file)
            
            # Group filings by CIK for bulk insert
            filing_data = []
            for cik, _, form, date, txt in tqdm(filings, desc="Parsing filings"):
                try:
                    filing_date = datetime.strptime(date, "%Y-%m-%d").date()
                    filing_data.append({
                        "cik": cik,
                        "filing_type": form,
                        "filing_date": filing_date,
                        "filing_url": txt
                    })
                except ValueError as e:
                    print(f"Error parsing date {date}: {e}")
                    continue

            if filing_data:
                print(f"Processing {len(filing_data)} filings...")
                insert_filing_batch(filing_data)

    except Exception as e:
        print(f"Error during seeding: {e}")

if __name__ == "__main__":
    seed_filings() 