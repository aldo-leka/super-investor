from datetime import datetime, timedelta
from typing import Optional, Union
import httpx
from fastapi import APIRouter, Depends, HTTPException, status, Body, UploadFile, File
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy.orm import Session
from google.oauth2 import id_token
from google.auth.transport import requests
from models import User
from db import get_db
from email_service import EmailService
import re
import os
from pathlib import Path

from config import (
    SECRET_KEY,
    ALGORITHM,
    ACCESS_TOKEN_EXPIRE_MINUTES,
    TURNSTILE_SECRET_KEY,
    GOOGLE_CLIENT_ID
)
from models import (
    UserCreate,
    UserLogin,
    Token,
    TokenResponse,
    TokenData,
    GoogleAuth,
    AuthProvider,
    UserResponse,
    ForgotPassword,
    ResetPassword,
    MagicLink,
    MagicLinkRequest,
    ProfileUpdate,
    PasswordUpdate,
    SetPassword,
    ProfileResponse,
    ProfileUpdateResponse
)

router = APIRouter(tags=["auth"])

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/token")

VERIFICATION_TOKEN_EXPIRE_HOURS = 24
PASSWORD_RESET_TOKEN_EXPIRE_HOURS = 1

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)


async def verify_turnstile(token: str) -> bool:
    print("TURNSTILE_SECRET_KEY", TURNSTILE_SECRET_KEY)
    async with httpx.AsyncClient() as client:
        response = await client.post(
            "https://challenges.cloudflare.com/turnstile/v0/siteverify",
            data={
                "secret": TURNSTILE_SECRET_KEY,
                "response": token
            }
        )
        print("Turnstile response:", response.json())
        result = response.json()
        return result.get("success", False)


def get_user(db: Session, email: str) -> Optional[User]:
    return db.query(User).filter(User.email == email).first()


def authenticate_user(db: Session, email: str, password: str) -> Optional[User]:
    user = get_user(db, email)
    if not user or not verify_password(password, user.hashed_password):
        return None
    return user


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
        token_data = TokenData(email=email)
    except JWTError:
        raise credentials_exception
    
    user = get_user(db, email=token_data.email)
    if user is None:
        raise credentials_exception
    return user


async def get_current_active_user(
    current_user: User = Depends(get_current_user)
) -> User:
    if not current_user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user


def generate_unique_username(db: Session, first_name: str, last_name: str) -> str:
    """Generate a unique username based on first and last name."""
    # Clean and format the name parts
    first = re.sub(r'[^a-zA-Z0-9]', '', first_name.lower())
    last = re.sub(r'[^a-zA-Z0-9]', '', last_name.lower())
    
    # Ensure we have at least 3 characters
    if len(first) < 2:
        first = first + 'user'
    if len(last) < 2:
        last = last + 'user'
    
    # Create base username (first-last)
    base = f"{first}-{last}"
    
    # Ensure it's not too long
    if len(base) > 30:
        base = base[:30]
    
    # Ensure it doesn't start with _ or -
    if base.startswith('_') or base.startswith('-'):
        base = 'user' + base
    
    username = base
    counter = 1
    
    while db.query(User).filter(User.username == username).first():
        # Add counter while keeping under 30 chars
        suffix = str(counter)
        if len(username) + len(suffix) > 30:
            username = username[:30 - len(suffix)] + suffix
        else:
            username = f"{base}{suffix}"
        counter += 1
    
    return username


@router.post("/register", response_model=UserResponse)
async def register(user_data: UserCreate, db: Session = Depends(get_db)):
    # Check if user already exists by email
    db_user = get_user(db, user_data.email)
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Check if username is already taken (for email registration)
    if user_data.username:
        existing_username = db.query(User).filter(User.username == user_data.username).first()
        if existing_username:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username already taken"
            )
    
    # Verify Turnstile token
    if not await verify_turnstile(user_data.turnstile_token):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid CAPTCHA"
        )
    
    # Create new user
    hashed_password = get_password_hash(user_data.password)
    db_user = User(
        email=user_data.email,
        username=user_data.username,
        first_name=user_data.first_name,
        last_name=user_data.last_name,
        hashed_password=hashed_password,
        auth_provider=AuthProvider.EMAIL,
        is_verified=False,
        verification_token=create_verification_token(user_data.email)
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    # Send verification email
    await EmailService.send_verification_email(user_data.email, db_user.verification_token)
    await EmailService.send_welcome_email(user_data.email, user_data.username)

    # Create and return token for immediate login
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": db_user.email},
        expires_delta=access_token_expires
    )
    return {
        **db_user.dict(),
        "access_token": access_token,
        "token_type": "bearer"
    }


@router.post("/token", response_model=TokenResponse)
async def login(user_data: UserLogin, db: Session = Depends(get_db)):
    print("Got turnstile token", user_data.turnstile_token)
    # Verify Turnstile token
    if not await verify_turnstile(user_data.turnstile_token):
        print("Invalid CAPTCHA")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid CAPTCHA"
        )
    
    # Authenticate user
    user = authenticate_user(db, user_data.email, user_data.password)
    if not user:
        print("Incorrect email or password")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.is_verified:
        # Check if we should send a new verification email
        should_send_email = False
        if not user.verification_token:
            user.verification_token = create_verification_token(user.email)
            should_send_email = True
        elif not user.last_verification_email_sent:
            should_send_email = True
        else:
            # Check if last email was sent more than an hour ago
            time_since_last_email = datetime.utcnow() - user.last_verification_email_sent
            if time_since_last_email > timedelta(hours=1):
                should_send_email = True

        if should_send_email:
            print("Sending verification email")
            await EmailService.send_verification_email(user.email, user.verification_token)
            user.last_verification_email_sent = datetime.utcnow()
            db.commit()
            print("Verification email sent")
        
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Please verify your email before logging in. Check your inbox for the verification link."
        )
    
    # Update last login
    user.last_login = datetime.utcnow()
    db.commit()
    
    # Create access token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )

    print("User data before response:", {  # Debug log
        "email": user.email,
        "username": user.username,
        "first_name": user.first_name,
        "last_name": user.last_name,
        "profile_picture_url": user.profile_picture_url,
        "subscription_tier": user.subscription_tier
    })

    response_data = {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "email": user.email,
            "username": user.username,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "image": user.profile_picture_url,
            "subscription_tier": user.subscription_tier
        }
    }
    print("Login response data:", response_data)  # Debug log
    return response_data


@router.post("/google", response_model=TokenResponse)
async def google_auth(google_data: GoogleAuth, db: Session = Depends(get_db)):
    try:
        # Use the access token to get user info from Google
        async with httpx.AsyncClient() as client:
            response = await client.get(
                'https://www.googleapis.com/oauth2/v3/userinfo',
                headers={'Authorization': f'Bearer {google_data.token}'}
            )
            if response.status_code != 200:
                raise ValueError('Failed to get user info from Google')
            
            userinfo = response.json()
            email = userinfo.get('email')
            if not email:
                raise ValueError('Email not found in token')

            google_id = userinfo.get('sub')
            first_name = userinfo.get('given_name')
            last_name = userinfo.get('family_name')
            picture = userinfo.get('picture')
            
            # Check if user exists
            user = get_user(db, email)
            
            if not user:
                # Generate unique username for new Google users
                username = generate_unique_username(db, first_name or 'user', last_name or 'google')
                
                # Create new user
                user = User(
                    email=email,
                    username=username,
                    first_name=first_name,
                    last_name=last_name,
                    google_id=google_id,
                    auth_provider=AuthProvider.GOOGLE,
                    profile_picture_url=picture,
                    is_verified=True  # Google emails are pre-verified
                )
                db.add(user)
            else:
                # Update existing user's Google info
                user.google_id = google_id
                user.auth_provider = AuthProvider.GOOGLE
                user.profile_picture_url = picture
                if first_name and last_name:
                    user.first_name = first_name
                    user.last_name = last_name
                user.last_login = datetime.utcnow()
            
            db.commit()
            db.refresh(user)
            
            # Create JWT token
            access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
            access_token = create_access_token(
                data={"sub": user.email}, 
                expires_delta=access_token_expires
            )

            return {
                "access_token": access_token,
                "token_type": "bearer",
                "user": {
                    "email": user.email,
                    "name": user.username,
                    "first_name": user.first_name,
                    "last_name": user.last_name,
                    "image": user.profile_picture_url,
                    "subscription_tier": user.subscription_tier
                }
            }
            
    except Exception as e:
        print(f"Google auth error: {str(e)}")  # Add logging for debugging
        raise HTTPException(
            status_code=400,
            detail=f"Invalid Google token: {str(e)}"
        )


@router.get("/session", response_model=TokenResponse)
async def get_session(current_user: User = Depends(get_current_active_user)):
    """Get the current session information including user details and a refreshed token."""
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": current_user.email},
        expires_delta=access_token_expires
    )
    
    print("Session response data:", {  # Debug log
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "email": current_user.email,
            "username": current_user.username,
            "first_name": current_user.first_name,
            "last_name": current_user.last_name,
            "image": current_user.profile_picture_url,
            "subscription_tier": current_user.subscription_tier
        }
    })
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "email": current_user.email,
            "username": current_user.username,
            "first_name": current_user.first_name,
            "last_name": current_user.last_name,
            "image": current_user.profile_picture_url,
            "subscription_tier": current_user.subscription_tier
        }
    }


@router.get("/users/me", response_model=UserResponse)
async def get_current_user_info(current_user: User = Depends(get_current_active_user)):
    """Get information about the currently authenticated user."""
    return current_user


def create_verification_token(email: str) -> str:
    expire = datetime.utcnow() + timedelta(hours=VERIFICATION_TOKEN_EXPIRE_HOURS)
    to_encode = {"sub": email, "exp": expire, "type": "verification"}
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def create_password_reset_token(email: str) -> str:
    expire = datetime.utcnow() + timedelta(hours=PASSWORD_RESET_TOKEN_EXPIRE_HOURS)
    to_encode = {"sub": email, "exp": expire, "type": "password_reset"}
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def verify_token(token: str) -> dict:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=400, detail="Token has expired")
    except jwt.JWTError:
        raise HTTPException(status_code=400, detail="Invalid token")


@router.get("/verify-email/{token}")
async def verify_email(token: str, db: Session = Depends(get_db)):
    try:
        payload = verify_token(token)
        if payload.get("type") != "verification":
            raise HTTPException(status_code=400, detail="Invalid token type")
        
        email = payload.get("sub")
        user = db.query(User).filter(User.email == email).first()
        
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        if user.is_verified:
            # If already verified, return user data and new token
            access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
            access_token = create_access_token(
                data={"sub": user.email},
                expires_delta=access_token_expires
            )
            return {
                "message": "Email already verified",
                "access_token": access_token,
                "token_type": "bearer",
                "user": {
                    "email": user.email,
                    "username": user.username,
                    "first_name": user.first_name,
                    "last_name": user.last_name,
                    "image": user.profile_picture_url,
                    "subscription_tier": user.subscription_tier
                }
            }
        
        # Verify email and create new token
        user.is_verified = True
        user.verification_token = None
        db.commit()
        
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": user.email},
            expires_delta=access_token_expires
        )
        
        return {
            "message": "Email verified successfully",
            "access_token": access_token,
            "token_type": "bearer",
            "user": {
                "email": user.email,
                "username": user.username,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "image": user.profile_picture_url,
                "subscription_tier": user.subscription_tier
            }
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/forgot-password")
async def forgot_password(data: ForgotPassword, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == data.email).first()
    if not user:
        # Return success even if user doesn't exist to prevent email enumeration
        return {"message": "If the email exists, a password reset link has been sent"}
    
    print("Sending password reset email")

    reset_token = create_password_reset_token(data.email)
    user.reset_password_token = reset_token
    db.commit()
    
    await EmailService.send_password_reset_email(data.email, reset_token)
    print("Password reset email sent")
    return {"message": "If the email exists, a password reset link has been sent"}


@router.post("/reset-password")
async def reset_password(data: ResetPassword, db: Session = Depends(get_db)):
    try:
        payload = verify_token(data.token)
        if payload.get("type") != "password_reset":
            raise HTTPException(status_code=400, detail="Invalid token type")
        
        email = payload.get("sub")
        user = db.query(User).filter(User.email == email).first()
        
        if not user or user.reset_password_token != data.token:
            raise HTTPException(status_code=400, detail="Invalid or expired token")
        
        user.hashed_password = get_password_hash(data.new_password)
        user.reset_password_token = None
        db.commit()
        
        return {"message": "Password reset successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


def create_magic_link_token(email: str) -> str:
    expire = datetime.utcnow() + timedelta(hours=24)
    to_encode = {"sub": email, "exp": expire, "type": "magic_link"}
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


@router.post("/magic-link")
async def create_magic_link(
    data: MagicLinkRequest,
    db: Session = Depends(get_db)
):
    """Create a magic link for email authentication."""
    # Verify Turnstile token
    if not await verify_turnstile(data.turnstile_token):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid CAPTCHA"
        )

    # Create magic link token
    expires_at = datetime.utcnow() + timedelta(hours=24)
    token = create_magic_link_token(data.email)
    
    # Save magic link to database
    magic_link = MagicLink(
        email=data.email,
        token=token,
        expires_at=expires_at,
        stripe_customer_id=data.stripe_customer_id,
        stripe_subscription_id=data.stripe_subscription_id
    )
    db.add(magic_link)
    db.commit()
    
    # Send magic link email
    await EmailService.send_magic_link_email(data.email, token)
    
    return {"message": "Magic link sent successfully"}


@router.get("/verify-magic-link/{token}")
async def verify_magic_link(token: str, db: Session = Depends(get_db)):
    """Verify magic link and create/login user."""
    magic_link = db.query(MagicLink).filter(
        MagicLink.token == token,
        MagicLink.used == False,
        MagicLink.expires_at > datetime.utcnow()
    ).first()
    
    if not magic_link:
        print("Invalid or expired magic link")
        raise HTTPException(status_code=400, detail="Invalid or expired magic link")
    
    # Find or create user
    user = get_user(db, magic_link.email)
    if not user:
        # Generate a unique username from the email
        email_parts = magic_link.email.split('@')
        username = generate_unique_username(db, email_parts[0], 'user')
        
        # Create new user
        user = User(
            email=magic_link.email,
            username=username,
            auth_provider=AuthProvider.MAGIC_LINK,
            is_verified=True
        )
        db.add(user)
    
    # Update Stripe info if available
    if magic_link.stripe_customer_id:
        user.stripe_customer_id = magic_link.stripe_customer_id
    
    # Mark magic link as used
    magic_link.used = True
    db.commit()
    
    # Create access token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email},
        expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "email": user.email,
            "username": user.username,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "image": user.profile_picture_url,
            "subscription_tier": user.subscription_tier
        }
    }


@router.put("/profile", response_model=ProfileUpdateResponse)
async def update_profile(
    profile_data: ProfileUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Update user profile information."""
    # Check if username is already taken by another user
    if profile_data.username and profile_data.username != current_user.username:
        existing_user = db.query(User).filter(
            User.username == profile_data.username,
            User.id != current_user.id
        ).first()
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username already taken"
            )

    # Check if email is already taken by another user
    if profile_data.email and profile_data.email != current_user.email:
        existing_user = db.query(User).filter(
            User.email == profile_data.email,
            User.id != current_user.id
        ).first()
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )

    # Update user profile
    if profile_data.username:
        current_user.username = profile_data.username
    if profile_data.first_name:
        current_user.first_name = profile_data.first_name
    if profile_data.last_name:
        current_user.last_name = profile_data.last_name
    if profile_data.email:
        current_user.email = profile_data.email
        # If email is changed, mark as unverified and send verification email
        current_user.is_verified = False
        current_user.verification_token = create_verification_token(profile_data.email)
        await EmailService.send_verification_email(profile_data.email, current_user.verification_token)

    db.commit()
    db.refresh(current_user)

    # Create access token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": current_user.email},
        expires_delta=access_token_expires
    )

    # Return response in the correct format
    return {
        "email": current_user.email,
        "username": current_user.username,
        "first_name": current_user.first_name,
        "last_name": current_user.last_name,
        "profile_picture_url": current_user.profile_picture_url,
        "subscription_tier": current_user.subscription_tier,
        "access_token": access_token,
        "token_type": "bearer"
    }


@router.put("/password")
async def update_password(
    password_data: Union[PasswordUpdate, SetPassword],
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Update user password or set initial password."""
    # If user has no password set (magic link or Google user), allow setting initial password
    if not current_user.hashed_password:
        if not isinstance(password_data, SetPassword):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Current password not required for initial password setting"
            )
        current_user.hashed_password = get_password_hash(password_data.new_password)
        db.commit()
        return {"message": "Password set successfully"}
    
    # For existing password users, verify current password
    if not isinstance(password_data, PasswordUpdate):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password required for password update"
        )
    
    if not verify_password(password_data.current_password, current_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Current password is incorrect"
        )

    # Update password
    current_user.hashed_password = get_password_hash(password_data.new_password)
    db.commit()

    return {"message": "Password updated successfully"}


@router.get("/profile", response_model=ProfileResponse)
async def get_profile(current_user: User = Depends(get_current_active_user)):
    """Get user profile information."""
    return {
        "email": current_user.email,
        "username": current_user.username,
        "first_name": current_user.first_name,
        "last_name": current_user.last_name,
        "profile_picture_url": current_user.profile_picture_url,
        "subscription_tier": current_user.subscription_tier,
        "has_password": current_user.hashed_password is not None
    }
