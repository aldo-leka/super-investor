from fastapi import APIRouter, Request, HTTPException, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_, desc, case
from sqlalchemy.sql.expression import literal
from typing import List
from db import get_db
from models import Ticker
from slowapi import Limiter
from slowapi.util import get_remote_address

router = APIRouter(tags=["tickers"])
limiter = Limiter(key_func=get_remote_address)

@router.get("/search")
@limiter.limit("300/minute")
async def search_tickers(
    request: Request,
    query: str = Query(..., min_length=1, max_length=100),
    limit: int = Query(15, gt=0, le=500),
    db: Session = Depends(get_db)
):
    """Search tickers by name or symbol."""
    if not query:
        return []
        
    search_query = f"%{query}%"
    
    results = db.query(Ticker).filter(
        or_(
            Ticker.name.ilike(search_query),
            Ticker.symbol.ilike(search_query)
        )
    ).order_by(
        # Prioritize non-null symbols
        case(
            (Ticker.symbol.is_(None), literal(2)),  # Null symbols get lowest priority
            else_=literal(1)                        # Non-null symbols get higher priority
        ),
        Ticker.name
    ).limit(limit).all()
    
    return results
