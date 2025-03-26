from fastapi import APIRouter, Request, Depends, Query, HTTPException
from fastapi.security import HTTPAuthorizationCredentials
from deps import verify_cron_token
from sec import update_tickers_data, update_edgar_filings_data
from deps import limiter

router = APIRouter()


@router.post("/cron/update-tickers")
@limiter.limit("1/hour")
def update_tickers(
        request: Request,
        testing: bool = Query(False),
        auth: HTTPAuthorizationCredentials = Depends(verify_cron_token)):
    return update_tickers_data(testing)


@router.post("/cron/update-edgar-filings")
@limiter.limit("1/hour")
def update_edgar_filings(
        request: Request,
        testing: bool = Query(False),
        auth: HTTPAuthorizationCredentials = Depends(verify_cron_token)):
    return update_edgar_filings_data(testing)
