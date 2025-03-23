from fastapi import FastAPI, HTTPException, Depends, Header, Query, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from fastapi.responses import JSONResponse
from slowapi.errors import RateLimitExceeded
from urllib.parse import urlparse
from typing import List
import psycopg2
import requests
import os

load_dotenv()

app = FastAPI()

USER_AGENT = os.getenv("USER_AGENT")
if not USER_AGENT:
    raise RuntimeError("USER_AGENT environment variable is not set. Please define it in your .env file.")

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise RuntimeError("DATABASE_URL environment variable is not set. Please define it in your .env file.")

TICKER_API_SECRET = os.getenv("TICKER_API_SECRET")
if not TICKER_API_SECRET:
    raise RuntimeError("TICKER_API_SECRET environment variable is not set. Please define it in your .env file.")

ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS").split(",")
if not ALLOWED_ORIGINS:
    raise RuntimeError("ALLOWED_ORIGINS environment variable is not set. Please define it in your .env file.")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[origin.strip() for origin in ALLOWED_ORIGINS],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

security = HTTPBearer()

# Dependency to check Authorization header
def verify_cron_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    if token != TICKER_API_SECRET:
        raise HTTPException(status_code=403, detail="Invalid token.")

@app.post("/cron/update-tickers")
def update_tickers(
        request: Request,
        testing: bool = Query(False),
        auth: HTTPAuthorizationCredentials = Depends(verify_cron_token)):
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

    # Parse data
    sec_data = {
        str(entry['cik_str']): {
            "company_name": entry.get("title"),
            "ticker": entry.get("ticker")
        }
        for entry in data.values()
    }

    # Insert/update to DB
    try:
        parsed = urlparse(DATABASE_URL)
        conn = psycopg2.connect(
            dbname=parsed.path[1:],
            user=parsed.username,
            password=parsed.password,
            host=parsed.hostname,
            port=parsed.port
        )
        cur = conn.cursor()

        for cik, info in sec_data.items():
            cur.execute("""
                INSERT INTO tickers (cik, company_name, ticker)
                VALUES (%s, %s, %s)
                ON CONFLICT (cik) DO UPDATE
                SET company_name = EXCLUDED.company_name,
                    ticker = EXCLUDED.ticker;
            """, (cik, info["company_name"], info["ticker"]))

        conn.commit()
        cur.close()
        conn.close()

        return {"status": "success", "tickers_updated": len(sec_data)}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@app.get("/tickers/search")
@limiter.limit("100/minute")
def search_tickers(request: Request, q: str = Query(..., min_length=1, max_length=100)) -> List[dict]:
    try:
        parsed = urlparse(DATABASE_URL)
        conn = psycopg2.connect(
            dbname=parsed.path[1:],
            user=parsed.username,
            password=parsed.password,
            host=parsed.hostname,
            port=parsed.port
        )
        cur = conn.cursor()

        cur.execute("""
            SELECT cik, company_name, ticker
            FROM tickers
            WHERE LOWER(company_name) LIKE LOWER(%s)
               OR LOWER(ticker) LIKE LOWER(%s)
            LIMIT 15;
        """, (f"%{q}%", f"%{q}%"))

        rows = cur.fetchall()
        cur.close()
        conn.close()

        return [
            {"cik": row[0], "company_name": row[1], "ticker": row[2]}
            for row in rows
        ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Search error: {str(e)}")


@app.get("/filings/by-cik/{cik}")
@limiter.limit("60/minute")
def get_filings_by_cik(
        request: Request,
        cik: str,
        limit: int = Query(100, gt=0, le=1000)  # Max 1000 results
) -> List[dict]:
    try:
        parsed = urlparse(DATABASE_URL)
        conn = psycopg2.connect(
            dbname=parsed.path[1:],
            user=parsed.username,
            password=parsed.password,
            host=parsed.hostname,
            port=parsed.port
        )
        cur = conn.cursor()

        cur.execute("""
            SELECT form_type, date_filed, txt_filename, quarter
            FROM edgar_filings
            WHERE cik = %s
            ORDER BY date_filed DESC
            LIMIT %s;
        """, (cik, limit))

        rows = cur.fetchall()
        cur.close()
        conn.close()

        return [
            {
                "form_type": row[0],
                "date_filed": row[1],
                "txt_filename": row[2],
                "quarter": row[3]
            }
            for row in rows
        ]

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching filings: {str(e)}")
