"""
Booking Service: Simulated Booking Lifecycle, PNR Reference Generation, and Persistence
"""

import random
import uuid
from datetime import datetime
from typing import Dict, Any, List, Optional
from app.supabase_client import DatabaseRepository
from app.models.schemas import BookingCreate, BookingUpdate

class BookingService:

    @staticmethod
    def generate_reference() -> str:
        """Generates cryptographically secure high-entropy booking reference TP-XXXXXXXX"""
        import secrets
        charset = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ"
        token = "".join(secrets.choice(charset) for _ in range(8))
        return f"TP-{token}"

    @classmethod
    async def create_booking(
        cls,
        payload: BookingCreate,
        journey_data: Dict[str, Any],
        payment_status: str = "PAID",
        razorpay_order_id: Optional[str] = None,
        razorpay_payment_id: Optional[str] = None,
        payment_method: str = "simulated"
    ) -> Dict[str, Any]:
        booking_id = f"bk_{uuid.uuid4().hex[:10]}"
        ref_number = cls.generate_reference()
        now_iso = datetime.now().isoformat()

        base_fare = float(journey_data.get("total_fare", 1000))
        taxes = round(base_fare * 0.12, 2)
        total_amount = round(base_fare + taxes, 2)

        booking_record = {
            "id": booking_id,
            "reference_number": ref_number,
            "created_at": now_iso,
            "status": "CONFIRMED",
            "journey": journey_data,
            "passengers": [p.dict() if hasattr(p, "dict") else p for p in payload.passengers],
            "fare_breakdown": {
                "base_fare": base_fare,
                "taxes_and_fees": taxes,
                "discounts": 0.0,
                "total_amount": total_amount
            },
            "contact_email": payload.contact_email,
            "contact_phone": payload.contact_phone,
            "notes": payload.notes or "Simulated prototype booking.",
            "is_simulated_demo": True,
            "payment_status": payment_status,
            "razorpay_order_id": razorpay_order_id,
            "razorpay_payment_id": razorpay_payment_id,
            "payment_method": payment_method,
            "user_id": payload.user_id
        }

        saved = await DatabaseRepository.save_booking(booking_record)
        return saved

    @classmethod
    async def get_all_bookings(cls) -> List[Dict[str, Any]]:
        return await DatabaseRepository.get_bookings()

    @classmethod
    async def get_user_bookings(cls, user_id: str, user_email: str) -> List[Dict[str, Any]]:
        """Filters bookings by user ID and verified contact email directly via database queries"""
        return await DatabaseRepository.get_bookings_by_user(user_id=user_id, email=user_email)

    @classmethod
    async def get_booking(cls, booking_id: str) -> Optional[Dict[str, Any]]:
        return await DatabaseRepository.get_booking_by_id(booking_id)

    @classmethod
    async def cancel_booking(cls, booking_id: str) -> Optional[Dict[str, Any]]:
        return await DatabaseRepository.update_booking_status(booking_id, "CANCELLED")

    @classmethod
    async def update_booking_details(cls, booking_id: str, updates: BookingUpdate) -> Optional[Dict[str, Any]]:
        booking = await DatabaseRepository.get_booking_by_id(booking_id)
        if not booking:
            return None
        
        if updates.contact_email:
            booking["contact_email"] = updates.contact_email
        if updates.contact_phone:
            booking["contact_phone"] = updates.contact_phone
        if updates.notes:
            booking["notes"] = updates.notes

        return booking
