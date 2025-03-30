import os
import tempfile
import itertools
import zipfile
import requests
from datetime import datetime
from retry import requests_retry_session
from config import USER_AGENT
from fastapi import HTTPException
from sqlalchemy.orm import Session
from db import get_db
from models import Ticker, Filing

BASE_URL = "https://www.sec.gov/Archives/edgar/full-index"


def update_tickers_data(testing: bool, db: Session = next(get_db())):
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

    try:
        tickers_updated = 0
        for entry in data.values():
            ticker = db.query(Ticker).filter(Ticker.cik == str(entry['cik_str'])).first()
            if ticker:
                ticker.name = entry.get("title")
                ticker.symbol = entry.get("ticker")
            else:
                new_ticker = Ticker(
                    cik=str(entry['cik_str']),
                    name=entry.get("title"),
                    symbol=entry.get("ticker")
                )
                db.add(new_ticker)
            tickers_updated += 1

        db.commit()
        return {"status": "success", "tickers_updated": tickers_updated}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


# TODO FIX THIS
def update_filings_data(testing: bool, db: Session = next(get_db())):
    if testing:
        return {"status": "success", "message": "Test mode: filing update skipped."}

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

            filings_processed = 0
            with zipfile.ZipFile(tmp).open("master.idx") as f:
                lines = [
                    line.decode("latin-1")
                    for line in itertools.islice(f, 11, None)
                ]
                entries = [line.strip().split("|") for line in lines if len(line.strip().split("|")) == 5]

            for entry in entries:
                cik, company_name, form_type, date_filed, txt_filename = entry
                
                # Check if filing already exists
                existing_filing = db.query(Filing).filter(
                    Filing.filing_url == txt_filename
                ).first()
                
                if not existing_filing:
                    new_filing = Filing(
                        cik=cik,
                        company_name=company_name,
                        form_type=form_type,
                        date_filed=date_filed,
                        filing_url=txt_filename,
                        quarter=quarter_key
                    )
                    db.add(new_filing)
                    filings_processed += 1

            db.commit()

            return {
                "status": "success",
                "filings_processed": filings_processed,
                "quarter": quarter_key,
                "timestamp": now.isoformat()
            }

    except Exception as e:
        db.rollback()
        return {"status": "error", "message": f"Download or processing failed: {str(e)}"}
