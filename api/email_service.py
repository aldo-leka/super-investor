import os
import resend
from fastapi import HTTPException
from typing import Optional
from config import RESEND_API_KEY, RESEND_FROM_EMAIL, FRONTEND_URL

resend.api_key = RESEND_API_KEY

class EmailService:
    @staticmethod
    async def send_verification_email(email: str, token: str) -> bool:
        try:
            verification_url = f"{FRONTEND_URL}/verify-email?token={token}"
            response = resend.Emails.send({
                "from": RESEND_FROM_EMAIL,
                "to": email,
                "subject": "Verify your email address",
                "html": f"""
                    <h1>Welcome to Super Investor!</h1>
                    <p>Please verify your email address by clicking the link below:</p>
                    <a href="{verification_url}">Verify Email</a>
                    <p>This link will expire in 24 hours.</p>
                    <p>If you didn't create an account, you can safely ignore this email.</p>
                """
            })
            print("Verification email sent", response)
            return response.get("id") is not None
        except Exception as e:
            print("Failed to send verification email", e)
            raise HTTPException(status_code=500, detail=f"Failed to send verification email: {str(e)}")

    @staticmethod
    async def send_password_reset_email(email: str, token: str) -> bool:
        try:
            reset_url = f"{FRONTEND_URL}/reset-password?token={token}"
            response = resend.Emails.send({
                "from": RESEND_FROM_EMAIL,
                "to": email,
                "subject": "Reset your password",
                "html": f"""
                    <h1>Password Reset Request</h1>
                    <p>You requested to reset your password. Click the link below to set a new password:</p>
                    <a href="{reset_url}">Reset Password</a>
                    <p>This link will expire in 1 hour.</p>
                    <p>If you didn't request a password reset, you can safely ignore this email.</p>
                """
            })
            print("Password reset email sent", response)
            return response.get("id") is not None
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to send password reset email: {str(e)}")

    @staticmethod
    async def send_welcome_email(email: str, name: Optional[str] = None) -> bool:
        try:
            greeting = f"Hi {name}!" if name else "Hi there!"
            response = resend.Emails.send({
                "from": RESEND_FROM_EMAIL,
                "to": email,
                "subject": "Welcome to Super Investor!",
                "html": f"""
                    <h1>Welcome to Super Investor!</h1>
                    <p>{greeting}</p>
                    <p>Thank you for joining Super Investor. We're excited to have you on board!</p>
                    <p>Here's what you can do with your account:</p>
                    <ul>
                        <li>Search and analyze SEC filings</li>
                        <li>Track your favorite stocks</li>
                        <li>Get insights from financial documents</li>
                    </ul>
                    <p>If you have any questions, feel free to reach out to our support team.</p>
                    <p>Best regards,<br>The Super Investor Team</p>
                """
            })
            print("Welcome email sent", response)
            return response.get("id") is not None
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to send welcome email: {str(e)}")

    @staticmethod
    async def send_subscription_welcome_email(email: str, name: Optional[str] = None, plan: str = "Starter") -> bool:
        try:
            greeting = f"Hi {name}!" if name else "Hi there!"
            response = resend.Emails.send({
                "from": RESEND_FROM_EMAIL,
                "to": email,
                "subject": f"Welcome to Super Investor {plan} Plan!",
                "html": f"""
                    <h1>Welcome to Super Investor {plan} Plan! 🎉</h1>
                    <p>{greeting}</p>
                    <p>Thanks for choosing the {plan} plan! We're excited to help you supercharge your investment research.</p>
                    <p>To access your account, simply click the button below to sign in:</p>
                    <p><a href="{FRONTEND_URL}/login" style="display: inline-block; padding: 12px 24px; background-color: #3b82f6; color: white; text-decoration: none; border-radius: 6px;">Sign In to Super Investor</a></p>
                    <p>On the sign-in page, enter this email address ({email}) then click the "Send Magic Link" button and we'll send you a secure login link.</p>
                    <p>Once you're logged in, you'll have immediate access to:</p>
                    <ul>
                        <li>Access to all public filings</li>
                        <li>Basic search functionality</li>
                        <li>Download tables as CSV</li>
                        <li>Simple filing viewer</li>
                        <li>Email support</li>
                    </ul>
                    <p>If you have any questions, just reply to this email - I'm here to help!</p>
                    <p>Best regards,<br>The Super Investor Team</p>
                """
            })
            print("Subscription welcome email sent", response)
            return response.get("id") is not None
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to send subscription welcome email: {str(e)}")

    @staticmethod
    async def send_magic_link_email(email: str, token: str) -> bool:
        try:
            login_url = f"{FRONTEND_URL}/verify-magic-link?token={token}"
            response = resend.Emails.send({
                "from": RESEND_FROM_EMAIL,
                "to": email,
                "subject": "Your Super Investor Magic Link",
                "html": f"""
                    <h1>Welcome to Super Investor!</h1>
                    <p>Click the link below to sign in to your account:</p>
                    <a href="{login_url}">Sign In to Super Investor</a>
                    <p>This link will expire in 24 hours.</p>
                    <p>If you didn't request this link, you can safely ignore this email.</p>
                """
            })
            print("Magic link email sent", response)
            return response.get("id") is not None
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to send magic link email: {str(e)}") 