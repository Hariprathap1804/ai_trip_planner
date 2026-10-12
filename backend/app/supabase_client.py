"""
Supabase Client Adapter for TripPilot AI
Supports direct Supabase PostgreSQL tables if credentials are configured in .env,
with transparent local seeded in-memory fallback.
"""

import os
import logging
from typing import Optional, List, Dict, Any
from app.config import settings
from app.data.mock_db import HUBS, MOCK_JOURNEYS, SAMPLE_BOOKINGS

logger = logging.getLogger(__name__)

supabase_client = None

if settings.SUPABASE_URL and settings.SUPABASE_KEY and "your-project" not in settings.SUPABASE_URL:
    try:
        from supabase import create_client, Client
        supabase_client: Optional[Client] = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
        logger.info("Supabase client initialized successfully.")
    except Exception as e:
        logger.warning(f"Could not connect to Supabase: {e}. Falling back to internal seeded repository.")
        supabase_client = None
else:
    logger.info("Supabase credentials not configured or default. Running with local high-fidelity prototype repository.")

# In-memory storage cache for prototype lifecycle
_in_memory_bookings: List[Dict[str, Any]] = [dict(b) for b in SAMPLE_BOOKINGS]

class DatabaseRepository:
    """Unified repository handling both Supabase and seeded storage"""
    
    @staticmethod
    async def get_all_hubs() -> List[Dict[str, Any]]:
        if supabase_client:
            try:
                res = supabase_client.table("hubs").select("*").execute()
                if res.data and len(res.data) > 0:
                    return res.data
            except Exception as e:
                logger.warning(f"Error querying hubs from Supabase: {e}")
        return HUBS

    @staticmethod
    async def get_all_journeys() -> List[Dict[str, Any]]:
        if supabase_client:
            try:
                res = supabase_client.table("journeys").select("*").execute()
                if res.data and len(res.data) > 0:
                    return res.data
            except Exception as e:
                logger.warning(f"Error querying journeys from Supabase: {e}")
        return MOCK_JOURNEYS

    @staticmethod
    async def get_bookings() -> List[Dict[str, Any]]:
        if supabase_client:
            try:
                res = supabase_client.table("bookings").select("*").order("created_at", desc=True).execute()
                if res.data:
                    return res.data
            except Exception as e:
                logger.warning(f"Error querying bookings from Supabase: {e}")
        return sorted(_in_memory_bookings, key=lambda x: x["created_at"], reverse=True)

    @staticmethod
    async def get_booking_by_id(booking_id: str) -> Optional[Dict[str, Any]]:
        if supabase_client:
            try:
                res = supabase_client.table("bookings").select("*").eq("id", booking_id).execute()
                if res.data and len(res.data) > 0:
                    return res.data[0]
            except Exception as e:
                logger.warning(f"Error querying booking by id from Supabase: {e}")
        for b in _in_memory_bookings:
            if b["id"] == booking_id or b["reference_number"] == booking_id:
                return b
        return None

    @staticmethod
    async def save_booking(booking: Dict[str, Any]) -> Dict[str, Any]:
        _in_memory_bookings.insert(0, booking)
        if supabase_client:
            try:
                # Prepare payload for Supabase schema
                payload = {
                    "id": booking["id"],
                    "reference_number": booking["reference_number"],
                    "status": booking["status"],
                    "journey_id": booking["journey"]["id"],
                    "journey_data": booking["journey"],
                    "passengers": booking["passengers"],
                    "fare_breakdown": booking["fare_breakdown"],
                    "contact_email": booking["contact_email"],
                    "contact_phone": booking["contact_phone"],
                    "notes": booking.get("notes", ""),
                    "is_simulated_demo": True
                }
                supabase_client.table("bookings").insert(payload).execute()
            except Exception as e:
                logger.warning(f"Could not persist booking to Supabase: {e}")
        return booking

    @staticmethod
    async def update_booking_status(booking_id: str, new_status: str) -> Optional[Dict[str, Any]]:
        target = None
        for b in _in_memory_bookings:
            if b["id"] == booking_id or b["reference_number"] == booking_id:
                b["status"] = new_status
                target = b
                break
        
        if supabase_client and target:
            try:
                supabase_client.table("bookings").update({"status": new_status}).eq("id", target["id"]).execute()
            except Exception as e:
                logger.warning(f"Could not update booking in Supabase: {e}")
        return target
