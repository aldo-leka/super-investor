from fastapi import FastAPI, HTTPException, Depends, status, Query, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from urllib.parse import urlparse
from typing import List
from requests.adapters import HTTPAdapter
from requests.exceptions import (
    ConnectionError,
    HTTPError,
    RequestException,
    RetryError,
    Timeout,
)
from urllib3.util import Retry
from bs4 import BeautifulSoup
from extract_items import ExtractItems
from typing import Any, Dict
from pydantic import BaseModel
from datetime import datetime
import psycopg2
import requests
import os
import re
import itertools
import tempfile
import zipfile

# Python version compatibility for HTML parser
try:
    from html.parser.HTMLParser import HTMLParseError
except ImportError:  # Python 3.5+

    class HTMLParseError(Exception):
        pass


class HealthCheck(BaseModel):
    """Response model to validate and return when performing a health check."""

    status: str = "OK"


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


@app.get(
    "/health",
    tags=["healthcheck"],
    summary="Perform a Health Check",
    response_description="Return HTTP Status Code 200 (OK)",
    status_code=status.HTTP_200_OK,
    response_model=HealthCheck,
)
def get_health() -> HealthCheck:
    return HealthCheck(status="OK")


@app.post("/cron/update-tickers")
@limiter.limit("1/hour")
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


@app.post("/cron/update-edgar-filings")
# @limiter.limit("1/hour")
def update_edgar_filings(
        request: Request,
        testing: bool = Query(False),
        auth: HTTPAuthorizationCredentials = Depends(verify_cron_token)
):
    if testing:
        return {"status": "success", "message": "Test mode: filing update skipped."}

    parsed = urlparse(DATABASE_URL)
    try:
        conn = psycopg2.connect(
            dbname=parsed.path[1:],
            user=parsed.username,
            password=parsed.password,
            host=parsed.hostname,
            port=parsed.port
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database connection failed: {str(e)}")

    cur = conn.cursor()

    now = datetime.utcnow()
    year = now.year
    quarter = (now.month - 1) // 3 + 1
    quarter_key = f"{year}_QTR{quarter}"

    url = f"https://www.sec.gov/Archives/edgar/full-index/{year}/QTR{quarter}/master.zip"

    try:
        with tempfile.TemporaryFile(mode="w+b") as tmp:
            retries_exceeded = True
            for _ in range(5):
                session = requests.Session()
                req = requests_retry_session(
                    retries=5, backoff_factor=0.2, session=session
                ).get(url=url, headers=USER_AGENT)

                if "will be managed until action is taken to declare your traffic." not in req.text:
                    retries_exceeded = False
                    break

            if retries_exceeded:
                return {"status": "error", "message": f"Retries exceeded for {url}"}

            tmp.write(req.content)
            tmp.seek(0)

            with zipfile.ZipFile(tmp).open("master.idx") as f:
                lines = [
                    line.decode("latin-1")
                    for line in itertools.islice(f, 11, None)
                ]
                entries = [line.strip().split("|") for line in lines if len(line.strip().split("|")) == 5]

        inserted = 0
        for entry in entries:
            cik, company_name, form_type, date_filed, txt_filename = entry
            try:
                cur.execute("""
                    INSERT INTO edgar_filings (cik, company_name, form_type, date_filed, txt_filename, quarter)
                    VALUES (%s, %s, %s, %s, %s, %s)
                    ON CONFLICT (txt_filename) DO NOTHING
                """, (cik, company_name, form_type, date_filed, txt_filename, quarter_key))
                inserted += 1
            except Exception:
                continue

        conn.commit()
        cur.close()
        conn.close()

        return {
            "status": "success",
            "quarter": quarter_key,
            "filings_inserted": inserted,
            "timestamp": now.isoformat()
        }

    except Exception as e:
        return {"status": "error", "message": f"Download or processing failed: {str(e)}"}


@app.get("/tickers/search")
@limiter.limit("300/minute")
def search_tickers(
        request: Request,
        q: str = Query(..., min_length=1, max_length=100),
        limit: int = Query(15, gt=0, le=15)
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
        cik: str
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


@app.get("/filings/{file_name:path}")
@limiter.limit("60/minute")
def get_filing(
    request: Request,
    file_name: str
) -> dict | None:
    # replace the fileName from ending with ".txt" to "-index.html"
    html_index = f"https://www.sec.gov/Archives/{file_name.replace('.txt', '-index.html')}"
    # get the response from that url and make sure to use the retry logic with user agent
    # Retries for making the request if not successful at first attempt
    try:
        # Exponential backoff retry logic
        retries_exceeded = True
        for _ in range(5):
            session = requests.Session()
            req = requests_retry_session(
                retries=5, backoff_factor=0.2, session=session
            ).get(url=html_index, headers={"User-agent": USER_AGENT})

            if (
                    "will be managed until action is taken to declare your traffic."
                    not in req.text
            ):
                retries_exceeded = False
                break

        if retries_exceeded:
            print(f'Retries exceeded, could not download "{html_index}"')
            return None

    except (RequestException, HTTPError, ConnectionError, Timeout, RetryError) as err:
        print(
            f"Request for {html_index} failed due to network-related error: {err}"
        )
        return None

    soup = BeautifulSoup(req.content, "lxml")

    # extract form description
        # from "Form 13F-HR - Quarterly report filed by institutional managers, Holdings"
        # to "Quarterly report filed by institutional managers"
    # extract filing type
    # extract filing date
    # extract tables for "Document Format Files" or "Data Format Files"
        # extract link to get filing content from the table
        # get the response from that url and make sure to use the retry logic with user agent
        # feed the content to ExtractItems or HtmlStripper
        # return the formatted json.
    # Crawl the soup for the financial files
    try:
        filing_type_text = soup.find("div", id="formName").find("strong").get_text(strip=True)
        filing_type = re.search(r"Form\s+(.+)", filing_type_text).group(1)
    except (HTMLParseError, Exception):
        return None

    filing_date = None
    for group in soup.find_all("div", class_="formGrouping"):
        labels = group.find_all("div", class_="infoHead")
        values = group.find_all("div", class_="info")

        for label, value in zip(labels, values):
            if label.get_text(strip=True) == "Filing Date":
                filing_date = value.get_text(strip=True)
                break
        if filing_date:
            break

    if filing_date is None:
        return None

    try:
        all_tables = soup.find_all("table")
    except (HTMLParseError, Exception):
        return None

    filing_types = ["10-K", "10-Q", "8-K"]

    """
    Tables are of 2 kinds. 
    The 'Document Format Files' table contains all the htms, jpgs, pngs and txts for the reports.
    The 'Data Format Files' table contains all the xml instances that contain structured information.
    """
    for table in all_tables:
        # Get the htm/html/txt files
        if table.attrs["summary"] == "Document Format Files":
            htm_file_link, complete_text_file_link, link_to_download = None, None, None

            # Iterate through rows to identify required links
            for tr in table.find_all("tr")[1:]: # [1:] skips first item
                # If it's the specific document type (e.g. 10-K)
                if tr.contents[7].text in filing_types:
                    if tr.contents[5].contents[0].attrs["href"].split(".")[-1] in [
                        "htm",
                        "html",
                    ]:
                        htm_file_link = (
                                "https://www.sec.gov"
                                + tr.contents[5].contents[0].attrs["href"]
                        )
                        break

                # Else get the complete submission text file
                elif tr.contents[3].text == "Complete submission text file":
                    complete_text_file_link = (
                            "https://www.sec.gov" + tr.contents[5].contents[0].attrs["href"]
                    )
                    break

            # Prepare final link to download
            if htm_file_link is not None:
                # In case of iXBRL documents, a slight URL modification is required
                if "ix?doc=/" in htm_file_link:
                    link_to_download = htm_file_link.replace("ix?doc=/", "")
                else:
                    link_to_download = htm_file_link

            elif complete_text_file_link is not None:
                link_to_download = complete_text_file_link

            # If a valid link is available, initiate download
            if link_to_download is not None:
                try:
                    # Initialize a flag to track if retries are exceeded
                    retries_exceeded = True

                    # Attempt to download the file up to 5 times
                    for _ in range(5):
                        # Create a new requests session
                        session = requests.Session()

                        # Make a GET request to the URL with retries and backoff
                        req = requests_retry_session(
                            retries=5, backoff_factor=0.2, session=session
                        ).get(url=link_to_download, headers={"User-agent": USER_AGENT})

                        # If the response does not contain a specific error message, break the loop
                        if (
                                "will be managed until action is taken to declare your traffic."
                                not in req.text
                        ):
                            retries_exceeded = False
                            break

                    # If retries are exceeded, log a debug message and return False
                    if retries_exceeded:
                        print(f'Retries exceeded, could not download "{link_to_download}')
                        return None

                    metadata: Dict[str, Any] = {
                        "Type": filing_type,
                        "Date": filing_date,
                        "filename": link_to_download
                    }
                    return ExtractItems(metadata, req.text).get_json()

                except (RequestException, HTTPError, ConnectionError, Timeout, RetryError) as err:
                    # If a network-related error occurs, log a debug message and return False
                    print(f"Request for {link_to_download} failed due to network-related error: {err}")
                    return None
            else:
                return None


def requests_retry_session(
        retries: int = 5,
        backoff_factor: float = 0.5,
        status_forcelist: tuple = (400, 401, 403, 500, 502, 503, 504, 505),
        session: requests.Session = None,
) -> requests.Session:
    """
    Creates a new requests session that automatically retries failed requests.

    Args:
            retries (int): The number of times to retry a failed request. Default is 5.
            backoff_factor (float): The delay factor to apply between retry attempts. Default is 0.5.
            status_forcelist (tuple): A tuple of HTTP status codes that should force a retry.
                    A retry is initiated if the HTTP status code of the response is in this list.
                    Default is a tuple of common server error codes.
            session (requests.Session): An existing requests session to use. If not provided, a new session will be created.

    Returns:
            requests.Session: A requests session configured with retry behavior.
    """

    # If no session provided, create a new one
    session = session or requests.Session()

    # Create a Retry object
    # It will specify how many times to retry a failed request and what HTTP status codes should force a retry
    retry = Retry(
        total=retries,
        read=retries,
        connect=retries,
        backoff_factor=backoff_factor,
        status_forcelist=status_forcelist,
    )

    # Create an HTTPAdapter with the Retry object
    # HTTPAdapter is a built-in requests Adapter that sends HTTP requests
    adapter = HTTPAdapter(max_retries=retry)

    # Mount the HTTPAdapter to the session for both HTTP and HTTPS requests
    session.mount("http://", adapter)
    session.mount("https://", adapter)

    # Return the session
    return session