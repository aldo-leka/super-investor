import json
import os
from sqlalchemy import create_engine, insert, update
from sqlalchemy.orm import sessionmaker
from sqlalchemy.exc import IntegrityError
from dotenv import load_dotenv
from datetime import datetime
from models import Ticker

# Load environment variables
load_dotenv()

# Create database engine
engine = create_engine(os.getenv("DATABASE_URL"))
SessionLocal = sessionmaker(bind=engine)

def load_company_tickers():
    with open("seed/company_tickers.json", "r") as f:
        return json.load(f)

def load_companies_info():
    with open("seed/companies_info.json", "r") as f:
        return json.load(f)

def seed_tickers():
    # Create a new session
    db = SessionLocal()
    
    try:
        # Load data from both files
        tickers_data = load_company_tickers()
        companies_info = load_companies_info()
        
        # Keep track of progress
        total = len(tickers_data)
        count = 0
        skipped = 0
        updated = 0
        inserted = 0
        
        # Prepare bulk insert/update data
        insert_data = []
        update_data = []
        
        # Process each company
        for cik_str, company_data in tickers_data.items():
            count += 1
            if count % 1000 == 0:
                print(f"Processing {count}/{total} companies...")
            
            # Get additional info from companies_info.json if available
            company_info = companies_info.get(cik_str, {})
            
            # Prepare ticker data
            ticker_data = {
                "cik": cik_str,
                "symbol": company_data.get("ticker"),  # This can be None for delisted companies
                "name": company_data.get("title"),
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            }
            
            # Check if record exists
            existing = db.query(Ticker).filter(Ticker.cik == cik_str).first()
            if existing:
                update_data.append(ticker_data)
                updated += 1
            else:
                insert_data.append(ticker_data)
                inserted += 1
        
        # Bulk insert new records
        if insert_data:
            print("Bulk inserting new records...")
            db.execute(insert(Ticker), insert_data)
        
        # Bulk update existing records
        if update_data:
            print("Bulk updating existing records...")
            for data in update_data:
                db.execute(
                    update(Ticker)
                    .where(Ticker.cik == data["cik"])
                    .values(data)
                )
        
        # Commit all changes
        print("Committing changes to database...")
        db.commit()
        
        print(f"Successfully processed {count} companies:")
        print(f"- Inserted: {inserted}")
        print(f"- Updated: {updated}")
        print(f"- Skipped: {skipped}")
        
    except Exception as e:
        print(f"Error seeding database: {str(e)}")
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    seed_tickers() 