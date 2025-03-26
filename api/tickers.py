from fastapi import APIRouter, Request, HTTPException, Query
from typing import List
from db import get_db_connection
from deps import limiter

router = APIRouter()


@router.get("/tickers/search")
@limiter.limit("300/minute")
def search_tickers(
        request: Request,
        q: str = Query(..., min_length=1, max_length=100),
        limit: int = Query(15, gt=0, le=1000)
) -> List[dict]:
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute("""
            SELECT cik, company_name, ticker
            FROM tickers
            WHERE LOWER(company_name) LIKE LOWER(%s)
               OR LOWER(ticker) LIKE LOWER(%s)
            ORDER BY (ticker IS NULL), company_name
            LIMIT %s;
        """, (f"%{q}%", f"%{q}%", limit))
        rows = cur.fetchall()
        cur.close()
        conn.close()
        return [{"cik": r[0], "company_name": r[1], "ticker": r[2]} for r in rows]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
