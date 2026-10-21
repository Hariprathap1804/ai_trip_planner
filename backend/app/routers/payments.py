"""
Payments Router: Razorpay Test Mode Order Creation, Public Config, and Signature Verification
"""

import logging
from fastapi import APIRouter, HTTPException, Depends, status
from typing import Dict, Any
from app.services.payment_service import PaymentService
from app.services.journey_service import JourneyService
from app.models.schemas import PaymentOrderCreate, PaymentVerifyAndBook
from app.routers.auth import get_current_user_required

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/payments", tags=["Payments"])

@router.get("/config")
async def get_payment_config() -> Dict[str, Any]:
    """
    Returns Razorpay public configuration (Key ID, currency, test mode status)
    Safe for frontend consumption (Secret is NEVER exposed).
    """
    return PaymentService.get_public_config()

@router.post("/create-order")
async def create_order(
    payload: PaymentOrderCreate,
    current_user: Dict[str, Any] = Depends(get_current_user_required)
) -> Dict[str, Any]:
    """
    Creates a Razorpay order in paise (INR). Requires authenticated user.
    Returns order_id, amount in paise, currency, and receipt ID.
    """
    if payload.amount <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Order amount must be greater than zero."
        )

    try:
        notes = payload.notes or {}
        notes["user_id"] = current_user.get("id")
        notes["user_email"] = current_user.get("email")

        order = PaymentService.create_order(
            amount=payload.amount,
            currency=payload.currency,
            receipt=payload.receipt,
            notes=notes
        )
        return {"success": True, "order": order}
    except Exception as e:
        logger.error(f"Error creating Razorpay order: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create payment order: {str(e)}"
        )

@router.post("/verify-and-book")
async def verify_and_book(
    payload: PaymentVerifyAndBook,
    current_user: Dict[str, Any] = Depends(get_current_user_required)
) -> Dict[str, Any]:
    """
    Cryptographically verifies the Razorpay payment HMAC signature,
    marks payment as PAID, and persists the booking for the authenticated user.
    """
    payload.booking_payload.user_id = current_user["id"]
    journey_data = payload.journey_data
    if not journey_data and payload.booking_payload.journey:
        journey_data = payload.booking_payload.journey.dict()
    elif not journey_data and payload.booking_payload.journey_id:
        journey_data = await JourneyService.get_journey_by_id(payload.booking_payload.journey_id)

    if not journey_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Valid journey information is required to finalize booking after payment."
        )

    try:
        booking = await PaymentService.verify_and_book(
            order_id=payload.order_id,
            payment_id=payload.payment_id,
            signature=payload.signature,
            booking_payload=payload.booking_payload,
            journey_data=journey_data
        )
        return {
            "success": True,
            "message": "Payment verified and booking confirmed successfully.",
            "booking": booking
        }
    except ValueError as val_err:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(val_err)
        )
    except Exception as e:
        logger.error(f"Error during verify-and-book: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Verification failed: {str(e)}"
        )
