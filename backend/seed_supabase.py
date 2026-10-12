"""
TripPilot AI: Automated Supabase Database Seeder
Seeds hubs, journeys across all 6 modes, and initial demo bookings into Supabase PostgreSQL tables.
Run: python seed_supabase.py
"""

import os
import sys
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL", "").strip()
SUPABASE_KEY = os.getenv("SUPABASE_KEY", "").strip()

if not SUPABASE_URL or not SUPABASE_KEY or "your-project" in SUPABASE_URL:
    print("❌ Error: SUPABASE_URL and SUPABASE_KEY must be set in backend/.env before running the seeder.")
    print("Please follow the instructions in README.md or backend/.env.")
    sys.exit(1)

try:
    from supabase import create_client
    from app.data.mock_db import HUBS, MOCK_JOURNEYS, SAMPLE_BOOKINGS

    print(f"Connecting to Supabase at {SUPABASE_URL}...")
    client = create_client(SUPABASE_URL, SUPABASE_KEY)
    
    # 1. Seed Transit Hubs
    print(f"Seeding {len(HUBS)} Transit Hubs into table 'hubs'...")
    hubs_payload = []
    for h in HUBS:
        hubs_payload.append({
            "id": h["id"],
            "name": h["name"],
            "city": h["city"],
            "code": h.get("code"),
            "type": h["type"],
            "latitude": h.get("coordinates", {}).get("lat"),
            "longitude": h.get("coordinates", {}).get("lng")
        })
    res_hubs = client.table("hubs").upsert(hubs_payload).execute()
    print("[OK] Hubs seeded successfully.")

    # 2. Seed Journeys
    print(f"Seeding {len(MOCK_JOURNEYS)} Journeys across 6 modes into table 'journeys'...")
    journeys_payload = []
    for j in MOCK_JOURNEYS:
        first_leg = j["legs"][0] if j["legs"] else {}
        journeys_payload.append({
            "id": j["id"],
            "mode": j["modes"][0] if not j["is_multimodal"] else "multimodal",
            "operator": first_leg.get("operator", "Express Travel"),
            "service_number": first_leg.get("service_number"),
            "origin_city": j["origin"]["city"],
            "destination_city": j["destination"]["city"],
            "origin_hub_id": j["origin"]["id"],
            "destination_hub_id": j["destination"]["id"],
            "departure_time": j["departure_time"],
            "arrival_time": j["arrival_time"],
            "duration_minutes": j["total_duration_minutes"],
            "base_fare": j["total_fare"],
            "class_or_category": first_leg.get("class_or_category", "Standard"),
            "stops_count": j.get("transfers_count", 0),
            "stop_details": first_leg.get("stop_details", []),
            "amenities": first_leg.get("amenities", []),
            "seat_status": first_leg.get("seat_status", "Available"),
            "baggage_allowance": first_leg.get("baggage_allowance", "Standard"),
            "is_multimodal": j["is_multimodal"],
            "legs": j["legs"]
        })
    res_j = client.table("journeys").upsert(journeys_payload).execute()
    print("[OK] Journeys seeded successfully.")

    # 3. Seed Sample Demo Bookings
    print(f"Seeding {len(SAMPLE_BOOKINGS)} Initial Demo Bookings into table 'bookings'...")
    bookings_payload = []
    for b in SAMPLE_BOOKINGS:
        bookings_payload.append({
            "id": b["id"],
            "reference_number": b["reference_number"],
            "status": b["status"],
            "journey_id": b["journey"]["id"],
            "journey_data": b["journey"],
            "passengers": b["passengers"],
            "fare_breakdown": b["fare_breakdown"],
            "contact_email": b["contact_email"],
            "contact_phone": b["contact_phone"],
            "notes": b.get("notes", "Seeded demo booking."),
            "is_simulated_demo": True
        })
    res_b = client.table("bookings").upsert(bookings_payload).execute()
    print("[OK] Demo Bookings seeded successfully.")

    print("\n[SUCCESS] Supabase seeding complete! All tables are populated and ready for live queries.")

except Exception as e:
    print(f"\n[ERROR] Seeding failed with error: {e}")
    print("Tip: If you see RLS policy error, run the updated backend/schema.sql in Supabase SQL Editor.")
