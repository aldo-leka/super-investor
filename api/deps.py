from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from config import TICKER_API_SECRET

security = HTTPBearer()

limiter = Limiter(key_func=get_remote_address)


def verify_cron_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    if token != TICKER_API_SECRET:
        raise HTTPException(status_code=403, detail="Invalid token.")
