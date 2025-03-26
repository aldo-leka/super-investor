from fastapi import APIRouter, Request, HTTPException
from typing import List
from db import get_db_connection
from slowapi import Limiter
from slowapi.util import get_remote_address

router = APIRouter()
limiter = Limiter(key_func=get_remote_address)


@router.get("/filings/by-cik/{cik}")
@limiter.limit("60/minute")
def get_filings_by_cik(request: Request, cik: str) -> List[dict]:
    try:
        conn = get_db_connection()
        cur = conn.cursor()

        cur.execute("""
            SELECT id, form_type, date_filed, txt_filename, quarter
            FROM edgar_filings
            WHERE cik = %s
            ORDER BY date_filed DESC;
        """, (cik,))

        rows = cur.fetchall()
        cur.close()
        conn.close()

        return [
            {
                "id": row[0],
                "form_type": row[1],
                "date_filed": row[2],
                "txt_filename": row[3],
                "quarter": row[4]
            }
            for row in rows
        ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching filings: {str(e)}")
