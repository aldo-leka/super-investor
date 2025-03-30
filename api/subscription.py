from datetime import datetime
from typing import Optional
import stripe
from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session
from pydantic import BaseModel

from config import STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, FRONTEND_URL
from db import get_db
from models import (
    User,
    SubscriptionTier,
    StripeCustomer,
    SubscriptionHistory,
    MagicLink,
    MagicLinkRequest
)
from models import SubscriptionStatus
from auth import get_current_active_user
from email_service import EmailService

router = APIRouter(tags=["subscription"])

stripe.api_key = STRIPE_SECRET_KEY

class CheckoutRequest(BaseModel):
    priceId: str
    billingCycle: str
    trialDays: int
    successUrl: str
    cancelUrl: str

def get_tier_from_price_id(price_id: str) -> SubscriptionTier:
    """Map Stripe price ID to subscription tier."""
    price_to_tier = {
        "price_basic": SubscriptionTier.BASIC,
        "price_pro": SubscriptionTier.PRO,
        "price_enterprise": SubscriptionTier.ENTERPRISE
    }
    return price_to_tier.get(price_id, SubscriptionTier.FREE)

@router.get("/status", response_model=SubscriptionStatus)
async def get_subscription_status(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get current subscription status."""
    if not current_user.stripe_customer_id:
        return SubscriptionStatus(
            tier=SubscriptionTier.FREE,
            status="inactive",
            current_period_end=None
        )
    
    try:
        # Get subscription from Stripe
        subscriptions = stripe.Subscription.list(
            customer=current_user.stripe_customer_id,
            limit=1
        )
        
        if not subscriptions.data:
            return SubscriptionStatus(
                tier=SubscriptionTier.FREE,
                status="inactive",
                current_period_end=None
            )
        
        subscription = subscriptions.data[0]
        return SubscriptionStatus(
            tier=get_tier_from_price_id(subscription.items.data[0].price.id),
            status=subscription.status,
            current_period_end=datetime.fromtimestamp(subscription.current_period_end)
        )
    except stripe.error.StripeError as e:
        print(f"Stripe error: {str(e)}")
        return SubscriptionStatus(
            tier=current_user.subscription_tier,
            status=current_user.subscription_status or "inactive",
            current_period_end=None
        )

@router.post("/create")
async def create_subscription(
    tier: SubscriptionTier,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Create a new subscription."""
    try:
        # Create or get Stripe customer
        stripe_customer = db.query(StripeCustomer).filter(
            StripeCustomer.user_id == current_user.id
        ).first()
        
        if not stripe_customer:
            # Create new Stripe customer
            customer = stripe.Customer.create(
                email=current_user.email,
                metadata={"user_id": current_user.id}
            )
            stripe_customer = StripeCustomer(
                user_id=current_user.id,
                stripe_customer_id=customer.id
            )
            db.add(stripe_customer)
            db.commit()
        
        # Create subscription
        price_id = f"price_{tier.value.lower()}"
        subscription = stripe.Subscription.create(
            customer=stripe_customer.stripe_customer_id,
            items=[{"price": price_id}],
            payment_behavior="default_incomplete",
            payment_settings={"save_default_payment_method": "on_subscription"},
            expand=["latest_invoice.payment_intent"]
        )
        
        # Update user's subscription info
        current_user.stripe_customer_id = stripe_customer.stripe_customer_id
        current_user.subscription_status = "pending"
        db.commit()
        
        return {
            "subscription_id": subscription.id,
            "client_secret": subscription.latest_invoice.payment_intent.client_secret
        }
    except stripe.error.StripeError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Stripe error: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred: {str(e)}"
        )

@router.post("/webhook")
async def stripe_webhook(
    request: Request,
    db: Session = Depends(get_db)
):
    """Handle Stripe webhook events."""
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature")
    
    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, STRIPE_WEBHOOK_SECRET
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail="Invalid payload")
    except stripe.error.SignatureVerificationError as e:
        raise HTTPException(status_code=400, detail="Invalid signature")
    
    if event.type == 'customer.subscription.updated':
        subscription = event.data.object
        user = db.query(User).filter(
            User.stripe_customer_id == subscription.customer
        ).first()
        
        if user:
            # Update subscription tier
            new_tier = get_tier_from_price_id(subscription.items.data[0].price.id)
            
            if user.subscription_tier != new_tier:
                # Record subscription change
                subscription_history = SubscriptionHistory(
                    user_id=user.id,
                    old_tier=user.subscription_tier,
                    new_tier=new_tier,
                    payment_id=subscription.id
                )
                db.add(subscription_history)
                
                user.subscription_tier = new_tier
                user.subscription_status = subscription.status
                db.commit()
    
    elif event.type == 'customer.subscription.deleted':
        subscription = event.data.object
        user = db.query(User).filter(
            User.stripe_customer_id == subscription.customer
        ).first()
        
        if user:
            # Record subscription cancellation
            subscription_history = SubscriptionHistory(
                user_id=user.id,
                old_tier=user.subscription_tier,
                new_tier=SubscriptionTier.FREE,
                payment_id=subscription.id
            )
            db.add(subscription_history)
            
            user.subscription_tier = SubscriptionTier.FREE
            user.subscription_status = "canceled"
            db.commit()
    
    elif event.type == 'checkout.session.completed':
        session = event.data.object
        customer_email = session.customer_details.email
        customer_id = session.customer
        subscription_id = session.subscription
        
        # Create magic link for the customer
        await create_magic_link(
            MagicLinkRequest(
                email=customer_email,
                stripe_customer_id=customer_id,
                stripe_subscription_id=subscription_id
            ),
            db
        )
    
    return {"status": "success"}

@router.post("/cancel")
async def cancel_subscription(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Cancel current subscription."""
    if not current_user.stripe_customer_id:
        raise HTTPException(
            status_code=400,
            detail="No active subscription to cancel"
        )
    
    try:
        # Cancel subscription in Stripe
        subscription = stripe.Subscription.list(
            customer=current_user.stripe_customer_id,
            limit=1
        ).data[0]
        
        stripe.Subscription.delete(subscription.id)
        
        # Update user's subscription info
        current_user.subscription_tier = SubscriptionTier.FREE
        current_user.subscription_status = "canceled"
        db.commit()
        
        return {"status": "success"}
    except stripe.error.StripeError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Stripe error: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred: {str(e)}"
        )

@router.post("/create-checkout")
async def create_checkout_session(
    request: CheckoutRequest,
    db: Session = Depends(get_db)
):
    """Create a Stripe Checkout session without requiring authentication."""
    try:
        # Create new Stripe customer
        customer = stripe.Customer.create(
            email=None,  # Will be collected during checkout
            metadata={"source": "checkout"}
        )
        
        # Create checkout session
        session = stripe.checkout.Session.create(
            customer=customer.id,
            payment_method_types=['card'],
            line_items=[{
                'price': request.priceId,
                'quantity': 1,
            }],
            mode='subscription',
            success_url=request.successUrl,
            cancel_url=request.cancelUrl,
            trial_period_days=request.trialDays,
            metadata={
                'tier': request.priceId.replace('price_', '')
            },
            customer_email=None,  # Will be collected during checkout
        )
        
        return {"url": session.url}
    except stripe.error.StripeError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Stripe error: {str(e)}"
        )

@router.post("/create-portal")
async def create_customer_portal_session(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Create a Stripe Customer Portal session."""
    try:
        stripe_customer = db.query(StripeCustomer).filter(
            StripeCustomer.user_id == current_user.id
        ).first()
        
        if not stripe_customer:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No Stripe customer found"
            )
        
        session = stripe.billing_portal.Session.create(
            customer=stripe_customer.stripe_customer_id,
            return_url=f"{FRONTEND_URL}/dashboard"
        )
        
        return {"url": session.url}
    except stripe.error.StripeError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Stripe error: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred: {str(e)}"
        )