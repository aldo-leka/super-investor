import os
from dotenv import load_dotenv

load_dotenv()

USER_AGENT = os.getenv("USER_AGENT")
if not USER_AGENT:
    raise RuntimeError("USER_AGENT environment variable is not set.")

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise RuntimeError("DATABASE_URL environment variable is not set.")

TICKER_API_SECRET = os.getenv("TICKER_API_SECRET")
if not TICKER_API_SECRET:
    raise RuntimeError("TICKER_API_SECRET environment variable is not set.")

ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS").split(",")
if not ALLOWED_ORIGINS:
    raise RuntimeError("ALLOWED_ORIGINS environment variable is not set.")