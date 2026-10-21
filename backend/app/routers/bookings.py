from fastapi import APIRouter, HTTPException, Depends
from typing import List, Dict, Any, Optional
from app.services.booking_service import BookingService
from app.services.journey_service import JourneyService
from app.models.schemas import BookingCreate, BookingUpdate
from app.routers.auth import get_current_user_required, get_current_user_optional

router = APIRouter(prefix="/api/bookings", tags=["Bookings"])

@router.get("")
async def get_all_bookings(current_user: Optional[Dict[str, Any]] = Depends(get_current_user_optional)) -> List[Dict[str, Any]]:
    if not current_user:
        return []
    all_bookings = await BookingService.get_all_bookings()
    user_id = current_user.get("id")
    user_email = current_user.get("email", "").lower()
    user_bookings = [
        b for b in all_bookings 
        if b.get("user_id") == user_id or b.get("contact_email", "").lower() == user_email
    ]
    return user_bookings

@router.get("/{booking_id}")
async def get_booking(booking_id: str) -> Dict[str, Any]:
    booking = await BookingService.get_booking(booking_id)
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    return booking

@router.post("")
async def create_booking(
    payload: BookingCreate,
    current_user: Dict[str, Any] = Depends(get_current_user_required)
) -> Dict[str, Any]:
    payload.user_id = current_user["id"]
    journey_data = payload.journey.dict() if payload.journey else None
    if not journey_data and payload.journey_id:
        journey_data = await JourneyService.get_journey_by_id(payload.journey_id)
    
    if not journey_data:
        raise HTTPException(status_code=400, detail="Valid journey data or journey_id is required")

    return await BookingService.create_booking(payload, journey_data)

@router.post("/{booking_id}/cancel")
async def cancel_booking(booking_id: str) -> Dict[str, Any]:
    cancelled = await BookingService.cancel_booking(booking_id)
    if not cancelled:
        raise HTTPException(status_code=404, detail="Booking not found to cancel")
    return cancelled

@router.patch("/{booking_id}")
async def update_booking(booking_id: str, updates: BookingUpdate) -> Dict[str, Any]:
    updated = await BookingService.update_booking_details(booking_id, updates)
    if not updated:
        raise HTTPException(status_code=404, detail="Booking not found")
    return updated
