from typing import Optional
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Enum, JSON, Float, Text, Date
from sqlalchemy.orm import relationship
import enum
from pydantic import BaseModel, EmailStr, Field, validator
from datetime import datetime
from db import Base
from sqlalchemy.sql import func
import re

# Enums
class SubscriptionTier(str, enum.Enum):
    FREE = "free"
    PRO = "pro"
    ENTERPRISE = "enterprise"

class AuthProvider(str, enum.Enum):
    EMAIL = "EMAIL"
    GOOGLE = "GOOGLE"
    MAGIC_LINK = "MAGIC_LINK"

# SQLAlchemy Models
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    username = Column(String, unique=True, index=True)
    first_name = Column(String, nullable=True)
    last_name = Column(String, nullable=True)
    hashed_password = Column(String, nullable=True)  # Made nullable for magic link users
    subscription_tier = Column(Enum(SubscriptionTier), default=SubscriptionTier.FREE)
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    verification_token = Column(String, nullable=True)
    reset_password_token = Column(String, nullable=True)
    last_verification_email_sent = Column(DateTime, nullable=True)
    is_superuser = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    stripe_customer_id = Column(String, unique=True, nullable=True)
    subscription_status = Column(String, nullable=True)
    auth_provider = Column(Enum(AuthProvider), default=AuthProvider.EMAIL)
    google_id = Column(String, unique=True, nullable=True)
    profile_picture_url = Column(String, nullable=True)
    last_login = Column(DateTime(timezone=True), nullable=True)

    # Relationships
    stripe_customer = relationship("StripeCustomer", back_populates="user", uselist=False)
    subscription_history = relationship("SubscriptionHistory", back_populates="user")

class StripeCustomer(Base):
    __tablename__ = "stripe_customers"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    stripe_customer_id = Column(String, unique=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="stripe_customer")

class SubscriptionHistory(Base):
    __tablename__ = "subscription_history"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    old_tier = Column(Enum(SubscriptionTier))
    new_tier = Column(Enum(SubscriptionTier))
    changed_at = Column(DateTime, default=datetime.utcnow)
    payment_id = Column(String)

    # Relationships
    user = relationship("User", back_populates="subscription_history")

class Ticker(Base):
    __tablename__ = "tickers"

    id = Column(Integer, primary_key=True, index=True)
    cik = Column(String, unique=True, index=True)
    symbol = Column(String)
    name = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationship with filings
    filings = relationship("Filing", back_populates="ticker")

class Filing(Base):
    __tablename__ = "filings"

    id = Column(Integer, primary_key=True, index=True)
    ticker_id = Column(Integer, ForeignKey("tickers.id"))
    filing_type = Column(String)
    filing_date = Column(DateTime)
    filing_url = Column(String)
    filing_metadata = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationship with ticker
    ticker = relationship("Ticker", back_populates="filings")

# Pydantic Models for API
class UserBase(BaseModel):
    email: EmailStr

    @validator('email')
    def validate_email(cls, v):
        if not v:
            raise ValueError('Email is required')
        return v

class UserCreate(UserBase):
    password: str = Field(..., min_length=8)
    turnstile_token: str
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    username: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str
    turnstile_token: str

class UserUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    username: Optional[str] = None

class UserResponse(UserBase):
    id: int
    subscription_tier: SubscriptionTier
    is_active: bool
    is_verified: bool
    is_superuser: bool
    created_at: datetime
    updated_at: Optional[datetime]
    auth_provider: AuthProvider
    profile_picture_url: Optional[str]

    class Config:
        from_attributes = True

class ForgotPassword(BaseModel):
    email: EmailStr

class ResetPassword(BaseModel):
    token: str
    new_password: str = Field(..., min_length=8)

class GoogleAuth(BaseModel):
    token: str

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

class TokenResponse(Token):
    user: dict

class TokenData(BaseModel):
    email: Optional[str] = None

class SubscriptionStatus(BaseModel):
    tier: SubscriptionTier
    status: str
    current_period_end: Optional[datetime]

class HealthCheck(BaseModel):
    status: str = "OK"

class MagicLink(Base):
    __tablename__ = "magic_links"

    id = Column(Integer, primary_key=True)
    email = Column(String, index=True)
    token = Column(String, unique=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    expires_at = Column(DateTime(timezone=True))
    used = Column(Boolean, default=False)
    stripe_customer_id = Column(String, nullable=True)
    stripe_subscription_id = Column(String, nullable=True)

class MagicLinkRequest(BaseModel):
    email: EmailStr
    turnstile_token: str
    stripe_customer_id: Optional[str] = None
    stripe_subscription_id: Optional[str] = None

class ProfileUpdate(BaseModel):
    username: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[EmailStr] = None

class PasswordUpdate(BaseModel):
    current_password: str
    new_password: str

class SetPassword(BaseModel):
    new_password: str

class ProfileResponse(BaseModel):
    email: str
    username: str
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    profile_picture_url: Optional[str] = None
    subscription_tier: SubscriptionTier
    has_password: bool

    class Config:
        from_attributes = True

class ProfileUpdateResponse(BaseModel):
    email: str
    username: str
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    profile_picture_url: Optional[str] = None
    subscription_tier: SubscriptionTier
    access_token: str
    token_type: str

    class Config:
        from_attributes = True