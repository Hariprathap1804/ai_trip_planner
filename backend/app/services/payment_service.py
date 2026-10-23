"""
Payment Service: Razorpay Payment Gateway Integration (Test Mode)
Handles Order Creation, HMAC Signature Verification, and Payment Lifecycle
"""

import hmac
import hashlib
import uuid
import logging
from typing import Dict, Any, Optional
from app.config import settings
from app.services.booking_service import BookingService
from app.models.schemas import BookingCreate

logger = logging.getLogger(__name__)

# Initialize Razorpay Client if credentials configured
razorpay_client = None
if settings.RAZORPAY_KEY_ID and settings.RAZORPAY_KEY_SECRET and not settings.RAZORPAY_KEY_ID.startswith("rzp_test_trippilot"):
    try:
        import razorpay
        razorpay_client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))
        logger.info("Razorpay Client successfully initialized in Test Mode.")
    except Exception as e:
        logger.warning(f"Failed to initialize Razorpay Client: {e}. Running in simulated test gateway mode.")
        razorpay_client = None

class PaymentService:

    @classmethod
    def get_public_config(cls) -> Dict[str, Any]:
        """Returns public payment gateway configuration for the frontend"""
        has_real_keys = bool(
            settings.RAZORPAY_KEY_ID and 
            settings.RAZORPAY_KEY_SECRET and 
            not settings.RAZORPAY_KEY_ID.startswith("rzp_test_trippilot")
        )
        return {
            "key_id": settings.RAZORPAY_KEY_ID or "rzp_test_trippilot_demo",
            "currency": "INR",
            "is_test_mode": True,
            "has_live_credentials": has_real_keys,
            "gateway_name": "Razorpay"
        }

    @classmethod
    def create_order(
        cls,
        amount: float,
        currency: str = "INR",
        receipt: Optional[str] = None,
        notes: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Creates a Razorpay Order in paise (amount * 100).
        Uses live Razorpay API if credentials configured, otherwise generates simulated test order.
        """
        amount_paise = int(round(amount * 100))
        rcpt = receipt or f"rcpt_{uuid.uuid4().hex[:10]}"
        
        if razorpay_client:
            try:
                order_payload = {
                    "amount": amount_paise,
                    "currency": currency,
                    "receipt": rcpt,
                    "notes": notes or {"app": "TripPilot AI"}
                }
                order = razorpay_client.order.create(data=order_payload)
                return {
                    "order_id": order["id"],
                    "amount": amount,
                    "amount_paise": amount_paise,
                    "currency": currency,
                    "receipt": rcpt,
                    "key_id": settings.RAZORPAY_KEY_ID,
                    "is_simulated": False
                }
            except Exception as e:
                logger.warning(f"Razorpay order creation API call failed: {e}. Falling back to test simulated order.")

        # Fallback Simulated Test Order (prefixed with order_sim_ to avoid colliding with real Razorpay order IDs)
        simulated_order_id = f"order_sim_{uuid.uuid4().hex[:14]}"
        return {
            "order_id": simulated_order_id,
            "amount": amount,
            "amount_paise": amount_paise,
            "currency": currency,
            "receipt": rcpt,
            "key_id": settings.RAZORPAY_KEY_ID or "rzp_test_trippilot_demo",
            "is_simulated": True
        }

    @classmethod
    def verify_payment_signature(
        cls,
        order_id: str,
        payment_id: str,
        signature: str
    ) -> bool:
        """
        Cryptographically verifies the Razorpay payment signature using HMAC-SHA256:
        signature == HMAC_SHA256(order_id + '|' + payment_id, secret)
        """
        if not order_id or not payment_id:
            return False

        # Allow simulated signature verification ONLY when no live Razorpay credentials exist
        # and the order is an explicit simulated prototype order (order_sim_)
        is_mock_gateway = (
            not settings.RAZORPAY_KEY_SECRET or
            settings.RAZORPAY_KEY_SECRET == "trippilot_mock_secret" or
            settings.RAZORPAY_KEY_ID.startswith("rzp_test_trippilot")
        )
        if is_mock_gateway and order_id.startswith("order_sim_"):
            logger.info("Simulated test transaction verified in mock gateway mode.")
            return True

        # When real credentials are configured, signature MUST be non-empty and verified
        if not signature:
            logger.warning("Empty payment signature provided for live gateway transaction.")
            return False

        if razorpay_client:
            try:
                razorpay_client.utility.verify_payment_signature({
                    "razorpay_order_id": order_id,
                    "razorpay_payment_id": payment_id,
                    "razorpay_signature": signature
                })
                return True
            except Exception as e:
                logger.warning(f"Razorpay signature verification failed via SDK: {e}")

        # Direct HMAC-SHA256 calculation fallback
        try:
            if not settings.RAZORPAY_KEY_SECRET:
                return False
            msg = f"{order_id}|{payment_id}".encode("utf-8")
            key = settings.RAZORPAY_KEY_SECRET.encode("utf-8")
            expected_signature = hmac.new(key, msg, hashlib.sha256).hexdigest()
            return hmac.compare_digest(expected_signature, signature)
        except Exception as e:
            logger.error(f"Error computing HMAC-SHA256 signature: {e}")
            return False

    @classmethod
    async def verify_and_book(
        cls,
        order_id: str,
        payment_id: str,
        signature: str,
        booking_payload: BookingCreate,
        journey_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Verifies Razorpay payment signature, validates fare amount integrity,
        marks transaction as PAID, and creates the booking record in database.
        """
        is_valid = cls.verify_payment_signature(order_id, payment_id, signature)
        if not is_valid:
            raise ValueError("Invalid Razorpay payment signature. Transaction could not be verified.")

        # Fare amount integrity verification against canonical journey data
        pax_count = max(1, len(booking_payload.passengers))
        unit_fare = float(journey_data.get("total_fare", 0))
        base_fare = round(unit_fare * pax_count, 2)
        taxes = round(base_fare * 0.12, 2)
        total_fare_due = round(base_fare + taxes, 2)
        if total_fare_due <= 0:
            raise ValueError("Invalid journey fare calculation: amount must be greater than zero.")

        # If live Razorpay client is connected and this is not a mock order, verify amount from gateway
        if razorpay_client and not order_id.startswith("order_sim_"):
            try:
                rzp_order = razorpay_client.order.fetch(order_id)
                order_amount_inr = round(rzp_order.get("amount", 0) / 100, 2)
                # Ensure paid amount matches journey fare (allowing up to ₹2 tolerance for tax rounding)
                if abs(order_amount_inr - total_fare_due) > 2.0:
                    raise ValueError(
                        f"Price integrity violation: Captured order amount (₹{order_amount_inr}) does not match journey fare (₹{total_fare_due})."
                    )
            except ValueError:
                raise
            except Exception as e:
                logger.warning(f"Could not fetch order from Razorpay to verify amount: {e}")

        # Create booking via BookingService
        booking = await BookingService.create_booking(
            payload=booking_payload,
            journey_data=journey_data,
            payment_status="PAID",
            razorpay_order_id=order_id,
            razorpay_payment_id=payment_id,
            payment_method="razorpay_test" if not order_id.startswith("order_sim_") else "simulated_test"
        )
        return booking
