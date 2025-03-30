from fastapi import APIRouter, Request, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import List
from db import get_db
from models import Filing, Ticker
from slowapi import Limiter
from slowapi.util import get_remote_address

router = APIRouter(tags=["filings"])
limiter = Limiter(key_func=get_remote_address)


@router.get("/by-cik/{cik}")
@limiter.limit("60/minute")
def get_filings_by_cik(
    request: Request,
    cik: str,
    db: Session = Depends(get_db)
) -> List[dict]:
    try:
        # First get the ticker by CIK
        ticker = db.query(Ticker).filter(Ticker.cik == cik).first()
        if not ticker:
            raise HTTPException(status_code=404, detail="Ticker not found")

        # Get all filings for this ticker
        filings = db.query(Filing).filter(
            Filing.ticker_id == ticker.id).order_by(Filing.filing_date.desc()).all()

        return [
            {
                "id": filing.id,
                "filing_type": filing.filing_type,
                "filing_date": filing.filing_date,
                "filing_url": filing.filing_url
            }
            for filing in filings
        ]
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error fetching filings: {str(e)}")
