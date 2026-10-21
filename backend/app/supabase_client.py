"""
Supabase Client Adapter for TripPilot AI
Supports direct Supabase PostgreSQL tables if credentials are configured in .env,
with transparent local seeded in-memory fallback.
"""

import os
import re
import logging
from typing import Optional, List, Dict, Any
from app.config import settings
from app.data.mock_db import HUBS, HUB_MAP, MOCK_JOURNEYS, SAMPLE_BOOKINGS

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

def _hydrate_journey(row: Dict[str, Any]) -> Dict[str, Any]:
    """Hydrates a Supabase journey table row into the canonical Journey model"""
    if "origin" in row and isinstance(row["origin"], dict) and "city" in row["origin"]:
        return row

    orig_id = row.get("origin_hub_id")
    dest_id = row.get("destination_hub_id")
    orig_city = row.get("origin_city") or "Bengaluru"
    dest_city = row.get("destination_city") or "Chennai"

    orig_hub = HUB_MAP.get(orig_id) if orig_id else None
    if not orig_hub:
        orig_hub = {
            "id": orig_id or "orig_hub",
            "name": f"{orig_city} Transit Station",
            "city": orig_city,
            "type": "landmark"
        }

    dest_hub = HUB_MAP.get(dest_id) if dest_id else None
    if not dest_hub:
        dest_hub = {
            "id": dest_id or "dest_hub",
            "name": f"{dest_city} Transit Station",
            "city": dest_city,
            "type": "landmark"
        }

    legs = row.get("legs") or []
    if not legs:
        legs = [{
            "id": f"leg_{row.get('id', 'item')}",
            "mode": row.get("mode", "flight"),
            "operator": row.get("operator", "Express Travel"),
            "service_number": row.get("service_number"),
            "origin": orig_hub,
            "destination": dest_hub,
            "departure_time": row.get("departure_time", "2026-10-13T08:00:00"),
            "arrival_time": row.get("arrival_time", "2026-10-13T09:00:00"),
            "duration_minutes": int(row.get("duration_minutes", 60)),
            "fare": float(row.get("base_fare", 500)),
            "class_or_category": row.get("class_or_category", "Standard"),
            "stops_count": int(row.get("stops_count", 0)),
            "stop_details": row.get("stop_details") or [],
            "amenities": row.get("amenities") or [],
            "seat_status": row.get("seat_status", "Available"),
            "baggage_allowance": row.get("baggage_allowance", "Standard")
        }]

    modes = row.get("modes")
    if not modes:
        if row.get("is_multimodal") and legs:
            modes = list(dict.fromkeys(leg.get("mode", "flight") for leg in legs))
        else:
            modes = [row.get("mode", "flight")]

    total_fare = float(row.get("base_fare") if row.get("base_fare") is not None else row.get("total_fare", 500))
    total_dur = int(row.get("duration_minutes") if row.get("duration_minutes") is not None else row.get("total_duration_minutes", 60))

    return {
        "id": row.get("id"),
        "is_multimodal": bool(row.get("is_multimodal", len(legs) > 1)),
        "modes": modes,
        "origin": orig_hub,
        "destination": dest_hub,
        "departure_time": row.get("departure_time", "2026-10-13T08:00:00"),
        "arrival_time": row.get("arrival_time", "2026-10-13T09:00:00"),
        "total_duration_minutes": total_dur,
        "total_fare": total_fare,
        "legs": legs,
        "transfers_count": int(row.get("stops_count", max(0, len(legs) - 1))),
        "transfer_buffer_minutes": int(row.get("transfer_buffer_minutes", 0)),
        "recommended_score": float(row.get("recommended_score", 88)),
        "ai_recommendation_reason": row.get("ai_recommendation_reason") or f"{row.get('operator', 'Travel')} connection."
    }

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
                    return [_hydrate_journey(row) for row in res.data]
            except Exception as e:
                logger.warning(f"Error querying journeys from Supabase: {e}")
        return MOCK_JOURNEYS

    @staticmethod
    def _hydrate_booking(b: Dict[str, Any]) -> Dict[str, Any]:
        if "journey_data" in b and ("journey" not in b or not b["journey"]):
            b["journey"] = b["journey_data"]

        if not b.get("payment_status"):
            b["payment_status"] = "PAID" if b.get("status") == "CONFIRMED" else "PENDING"

        # If razorpay fields missing from Supabase row, parse from embedded notes tag
        notes = b.get("notes") or ""
        if "[RZP:" in notes:
            try:
                rzp_content = notes.split("[RZP:")[1].split("]")[0]
                for part in rzp_content.split(";"):
                    if "=" in part:
                        k, v = part.split("=", 1)
                        if k == "pay_id" and v and not b.get("razorpay_payment_id"):
                            b["razorpay_payment_id"] = v
                        elif k == "order_id" and v and not b.get("razorpay_order_id"):
                            b["razorpay_order_id"] = v
                        elif k == "method" and v and not b.get("payment_method"):
                            b["payment_method"] = v
            except Exception:
                pass

        if not b.get("payment_method"):
            b["payment_method"] = "razorpay_test" if b.get("razorpay_payment_id") else "simulated"

        return b

    @staticmethod
    async def get_bookings() -> List[Dict[str, Any]]:
        if supabase_client:
            try:
                res = supabase_client.table("bookings").select("*").order("created_at", desc=True).execute()
                if res.data:
                    return [DatabaseRepository._hydrate_booking(b) for b in res.data]
            except Exception as e:
                logger.warning(f"Error querying bookings from Supabase: {e}")
        return [DatabaseRepository._hydrate_booking(b) for b in sorted(_in_memory_bookings, key=lambda x: x["created_at"], reverse=True)]

    @staticmethod
    async def get_booking_by_id(booking_id: str) -> Optional[Dict[str, Any]]:
        if supabase_client:
            try:
                res = supabase_client.table("bookings").select("*").eq("id", booking_id).execute()
                if res.data and len(res.data) > 0:
                    return DatabaseRepository._hydrate_booking(res.data[0])
            except Exception as e:
                logger.warning(f"Error querying booking by id from Supabase: {e}")
        for b in _in_memory_bookings:
            if b["id"] == booking_id or b["reference_number"] == booking_id:
                return DatabaseRepository._hydrate_booking(b)
        return None

    @staticmethod
    async def get_bookings_by_user(user_id: str, email: str) -> List[Dict[str, Any]]:
        clean_email = (email or "").strip().lower()
        if supabase_client:
            try:
                # Query matching user_id first, then contact_email
                res = supabase_client.table("bookings").select("*").eq("user_id", user_id).order("created_at", desc=True).execute()
                bookings_map = {b["id"]: DatabaseRepository._hydrate_booking(b) for b in (res.data or [])}
                
                if clean_email:
                    res_email = supabase_client.table("bookings").select("*").eq("contact_email", clean_email).order("created_at", desc=True).execute()
                    for b in (res_email.data or []):
                        if b["id"] not in bookings_map:
                            bookings_map[b["id"]] = DatabaseRepository._hydrate_booking(b)
                
                if bookings_map:
                    return list(bookings_map.values())
            except Exception as e:
                logger.warning(f"Error querying user bookings from Supabase: {e}")
                
        # In-memory fallback
        return [
            DatabaseRepository._hydrate_booking(b)
            for b in sorted(_in_memory_bookings, key=lambda x: x.get("created_at", ""), reverse=True)
            if (b.get("user_id") and b.get("user_id") == user_id) or
               (b.get("contact_email") and b.get("contact_email", "").strip().lower() == clean_email)
        ]

    @staticmethod
    async def save_booking(booking: Dict[str, Any]) -> Dict[str, Any]:
        _in_memory_bookings.insert(0, booking)
        if supabase_client:
            rzp_tag = f" [RZP:pay_id={booking.get('razorpay_payment_id', '')};order_id={booking.get('razorpay_order_id', '')};method={booking.get('payment_method', '')}]"
            combined_notes = (booking.get("notes") or "") + rzp_tag

            try:
                # Prepare payload for Supabase schema with payment and user_id columns
                payload = {
                    "id": booking["id"],
                    "reference_number": booking["reference_number"],
                    "status": booking["status"],
                    "user_id": booking.get("user_id"),
                    "journey_id": booking["journey"]["id"],
                    "journey_data": booking["journey"],
                    "passengers": booking["passengers"],
                    "fare_breakdown": booking["fare_breakdown"],
                    "contact_email": booking["contact_email"],
                    "contact_phone": booking["contact_phone"],
                    "notes": combined_notes,
                    "is_simulated_demo": True,
                    "payment_status": booking.get("payment_status", "PAID"),
                    "razorpay_order_id": booking.get("razorpay_order_id"),
                    "razorpay_payment_id": booking.get("razorpay_payment_id"),
                    "payment_method": booking.get("payment_method", "simulated")
                }
                supabase_client.table("bookings").insert(payload).execute()
            except Exception as e:
                # Fallback if remote schema does not yet have payment or user_id columns
                try:
                    payload_base = {
                        "id": booking["id"],
                        "reference_number": booking["reference_number"],
                        "status": booking["status"],
                        "user_id": booking.get("user_id"),
                        "journey_id": booking["journey"]["id"],
                        "journey_data": booking["journey"],
                        "passengers": booking["passengers"],
                        "fare_breakdown": booking["fare_breakdown"],
                        "contact_email": booking["contact_email"],
                        "contact_phone": booking["contact_phone"],
                        "notes": combined_notes,
                        "is_simulated_demo": True
                    }
                    supabase_client.table("bookings").insert(payload_base).execute()
                except Exception as inner_e:
                    logger.warning(f"Could not persist booking to Supabase: {inner_e}")
        return booking

    @staticmethod
    async def update_booking_status(booking_id: str, new_status: str) -> Optional[Dict[str, Any]]:
        # Strictly sanitize booking_id to prevent PostgREST filter injection
        clean_id = (booking_id or "").strip()
        if not re.match(r"^[a-zA-Z0-9_\-]{3,64}$", clean_id):
            logger.warning(f"Invalid booking_id format rejected: {clean_id}")
            return None

        clean_status = (new_status or "").strip().upper()
        if clean_status not in ["CONFIRMED", "CANCELLED", "COMPLETED", "PENDING"]:
            logger.warning(f"Invalid booking status rejected: {clean_status}")
            return None

        target = None
        for b in _in_memory_bookings:
            if b["id"] == clean_id or b["reference_number"] == clean_id:
                b["status"] = clean_status
                target = b
                break
        
        if supabase_client:
            try:
                # Update by id or reference_number safely without string interpolation injection
                res = supabase_client.table("bookings").update({"status": clean_status}).eq("id", clean_id).execute()
                if not (res.data and len(res.data) > 0):
                    supabase_client.table("bookings").update({"status": clean_status}).eq("reference_number", clean_id).execute()
            except Exception as e:
                logger.warning(f"Could not update booking in Supabase: {e}")
        return target
