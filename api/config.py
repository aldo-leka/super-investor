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

SECRET_KEY = os.getenv("SECRET_KEY")
if not SECRET_KEY:
    raise RuntimeError("SECRET_KEY environment variable is not set.")

TURNSTILE_SECRET_KEY = os.getenv("TURNSTILE_SECRET_KEY")
if not TURNSTILE_SECRET_KEY:
    raise RuntimeError("TURNSTILE_SECRET_KEY environment variable is not set.")

GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
if not GOOGLE_CLIENT_ID:
    raise RuntimeError("GOOGLE_CLIENT_ID environment variable is not set.")

STRIPE_SECRET_KEY = os.getenv("STRIPE_SECRET_KEY")
if not STRIPE_SECRET_KEY:
    raise RuntimeError("STRIPE_SECRET_KEY environment variable is not set.")

STRIPE_WEBHOOK_SECRET = os.getenv("STRIPE_WEBHOOK_SECRET")
if not STRIPE_WEBHOOK_SECRET:
    raise RuntimeError("STRIPE_WEBHOOK_SECRET environment variable is not set.")

RESEND_API_KEY = os.getenv("RESEND_API_KEY")
if not RESEND_API_KEY:
    raise RuntimeError("RESEND_API_KEY environment variable is not set.")

RESEND_FROM_EMAIL = os.getenv("RESEND_FROM_EMAIL")
if not RESEND_FROM_EMAIL:
    raise RuntimeError("RESEND_FROM_EMAIL environment variable is not set.")

FRONTEND_URL = os.getenv("FRONTEND_URL")
if not FRONTEND_URL:
    raise RuntimeError("FRONTEND_URL environment variable is not set.")

ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30
REFRESH_TOKEN_EXPIRE_DAYS = 30  # Refresh tokens last 30 days
REFRESH_TOKEN_COOKIE_NAME = "refresh_token"
REFRESH_TOKEN_COOKIE_SECURE = True  # Only send cookie over HTTPS
REFRESH_TOKEN_COOKIE_HTTPONLY = True  # Prevent JavaScript access
REFRESH_TOKEN_COOKIE_SAMESITE = "none"  # lax Prevent CSRF attacks
REFRESH_TOKEN_COOKIE_DOMAIN = ".superinvestor.pro"  # Enables sharing between api.superinvestor.pro and superinvestor.pro