from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from dotenv import load_dotenv
import auth, subscription, tickers, filings, cron, filing_content, health
from db import init_db
import os

from config import ALLOWED_ORIGINS

load_dotenv()

# Initialize rate limiter
limiter = Limiter(key_func=get_remote_address)

app = FastAPI(
    title="Super Investor API",
    description="API for Super Investor application",
    version="1.0.0"
)

# Add rate limiter to app
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[origin.strip() for origin in ALLOWED_ORIGINS],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

# Include routers
app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(subscription.router, prefix="/subscription", tags=["subscription"])
app.include_router(tickers.router, prefix="/tickers", tags=["tickers"])
app.include_router(filings.router, prefix="/filings", tags=["filings"])
app.include_router(cron.router, prefix="/cron", tags=["cron"])
app.include_router(filing_content.router, tags=["filing-content"])
app.include_router(health.router, tags=["health"])

@app.on_event("startup")
async def startup_event():
    init_db()

