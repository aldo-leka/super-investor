from fastapi import APIRouter, Request, Depends, Query, HTTPException
from fastapi.security import HTTPAuthorizationCredentials
from deps import verify_cron_token, limiter
from sec import update_tickers_data, update_filings_data
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from db import get_db
from models import User
from email_service import EmailService
from auth import create_verification_token
import asyncio

router = APIRouter()


@router.post("/update-tickers")
@limiter.limit("1/hour")
def update_tickers(
        request: Request,
        testing: bool = Query(False),
        auth: HTTPAuthorizationCredentials = Depends(verify_cron_token)):
    return update_tickers_data(testing)


@router.post("/update-filings")
@limiter.limit("1/hour")
def update_filings(
        request: Request,
        testing: bool = Query(False),
        auth: HTTPAuthorizationCredentials = Depends(verify_cron_token)):
    return update_filings_data(testing)


@router.post("/resend-verification-emails")
@limiter.limit("1/5minutes")
async def resend_verification_emails(
        request: Request,
        auth: HTTPAuthorizationCredentials = Depends(verify_cron_token)):
    """Resend verification emails to users who haven't verified their email."""
    db: Session = next(get_db())
    try:
        # Get users who haven't verified their email
        unverified_users = db.query(User).filter(
            User.is_verified == False,
            User.auth_provider == "EMAIL"  # Only for email users, not Google
        ).all()

        emails_sent = 0
        for user in unverified_users:
            # Check if we should resend (not too frequent)
            if user.last_verification_email_sent:
                time_since_last = datetime.utcnow() - user.last_verification_email_sent
                if time_since_last < timedelta(hours=1):  # Don't send more than once per hour
                    continue

            # Generate new verification token if needed
            if not user.verification_token:
                user.verification_token = create_verification_token(user.email)
                db.commit()

            # Send verification email
            await EmailService.send_verification_email(user.email, user.verification_token)
            
            # Update last sent timestamp
            user.last_verification_email_sent = datetime.utcnow()
            db.commit()
            emails_sent += 1

            # Add a small delay between emails to avoid rate limiting
            await asyncio.sleep(1)

        return {"status": "success", "emails_sent": emails_sent}
    except Exception as e:
        return {"status": "error", "message": str(e)}


@router.post("/cleanup-expired-tokens")
@limiter.limit("1/hour")
async def cleanup_expired_tokens(
        request: Request,
        auth: HTTPAuthorizationCredentials = Depends(verify_cron_token)):
    """Clean up expired verification and password reset tokens."""
    db: Session = next(get_db())
    try:
        # Clean up expired verification tokens
        db.query(User).filter(
            User.is_verified == False,
            User.verification_token.isnot(None)
        ).update({
            User.verification_token: None,
            User.last_verification_email_sent: None
        })

        # Clean up expired password reset tokens
        db.query(User).filter(
            User.reset_password_token.isnot(None)
        ).update({
            User.reset_password_token: None
        })

        db.commit()
        return {"status": "success", "message": "Expired tokens cleaned up"}
    except Exception as e:
        return {"status": "error", "message": str(e)}
