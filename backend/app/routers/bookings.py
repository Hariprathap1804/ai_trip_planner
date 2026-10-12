from fastapi import APIRouter, HTTPException
from typing import List, Dict, Any
from app.services.booking_service import BookingService
from app.services.journey_service import JourneyService
from app.models.schemas import BookingCreate, BookingUpdate

router = APIRouter(prefix="/api/bookings", tags=["Bookings"])

@router.get("")
async def get_all_bookings() -> List[Dict[str, Any]]:
    return await BookingService.get_all_bookings()

@router.get("/{booking_id}")
async def get_booking(booking_id: str) -> Dict[str, Any]:
    booking = await BookingService.get_booking(booking_id)
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    return booking

@router.post("")
async def create_booking(payload: BookingCreate) -> Dict[str, Any]:
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
