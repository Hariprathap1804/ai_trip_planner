"""
Multimodal Service: Chaining Legs, Transfer Buffers, and Compatibility Validation
"""

from typing import List, Dict, Any, Tuple, Optional
from datetime import datetime
import uuid

MIN_BUFFERS = {
    "flight": 90,  # 90 mins for flight transfers (check-in/security)
    "train": 30,   # 30 mins for train transfers
    "bus": 20,     # 20 mins for bus transfers
    "metro": 10,   # 10 mins for metro interchanges
    "cab": 15,     # 15 mins for cab pickups
    "auto": 10     # 10 mins for auto
}

class MultimodalService:

    @staticmethod
    def parse_time_minutes(time_str: str) -> int:
        """Parses ISO timestamp or HH:MM into minutes from midnight"""
        try:
            if "T" in time_str:
                time_part = time_str.split("T")[1]
            else:
                time_part = time_str
            parts = time_part.split(":")
            return int(parts[0]) * 60 + int(parts[1])
        except Exception:
            return 0

    @classmethod
    def validate_connection(cls, leg_a: Dict[str, Any], leg_b: Dict[str, Any]) -> Tuple[bool, int, str]:
        """
        Validates connection between leg_a arrival and leg_b departure.
        Returns: (is_valid, buffer_minutes, warning_message)
        """
        arr_m = cls.parse_time_minutes(leg_a["arrival_time"])
        dep_m = cls.parse_time_minutes(leg_b["departure_time"])
        
        # Calculate buffer in minutes
        buffer_minutes = dep_m - arr_m
        if buffer_minutes < 0:
            # Check if next leg is next day
            buffer_minutes += 24 * 60

        next_mode = leg_b["mode"]
        min_required = MIN_BUFFERS.get(next_mode, 15)

        if buffer_minutes < 0:
            return (False, buffer_minutes, f"Impossible connection: Leg departs before previous leg arrives.")
        elif buffer_minutes < min_required:
            return (True, buffer_minutes, f"Tight transfer: Only {buffer_minutes}m buffer (Recommended min: {min_required}m for {next_mode}).")
        else:
            return (True, buffer_minutes, f"Comfortable transfer buffer: {buffer_minutes}m available.")

    @classmethod
    def compose_multimodal_journey(cls, legs: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Composes a list of legs into a unified Journey object with validated buffers"""
        if not legs:
            raise ValueError("At least one leg is required.")

        total_fare = sum(leg["fare"] for leg in legs)
        modes = list(dict.fromkeys(leg["mode"] for leg in legs))
        transfers_count = max(0, len(legs) - 1)

        # Calculate buffer times & warnings
        warnings = []
        total_buffer = 0
        for i in range(len(legs) - 1):
            is_valid, buffer_m, msg = cls.validate_connection(legs[i], legs[i+1])
            total_buffer += max(0, buffer_m)
            if not is_valid or "Tight" in msg:
                warnings.append(f"Transfer between Leg {i+1} and Leg {i+2}: {msg}")

        first_leg = legs[0]
        last_leg = legs[-1]
        
        # Calculate total journey duration including transfer buffers
        start_m = cls.parse_time_minutes(first_leg["departure_time"])
        end_m = cls.parse_time_minutes(last_leg["arrival_time"])
        total_duration = end_m - start_m
        if total_duration <= 0:
            total_duration += 24 * 60

        journey_id = f"mm_{uuid.uuid4().hex[:8]}"

        return {
            "id": journey_id,
            "is_multimodal": len(legs) > 1,
            "modes": modes,
            "origin": first_leg["origin"],
            "destination": last_leg["destination"],
            "departure_time": first_leg["departure_time"],
            "arrival_time": last_leg["arrival_time"],
            "total_duration_minutes": total_duration,
            "total_fare": total_fare,
            "legs": legs,
            "transfers_count": transfers_count,
            "transfer_buffer_minutes": total_buffer,
            "recommended_score": 90 if not warnings else 75,
            "ai_recommendation_reason": "Custom multimodal itinerary: " + " → ".join(m.title() for m in modes),
            "warnings": warnings
        }

    @classmethod
    def find_city_hub(cls, city: str, preferred_type: str = "railway_station") -> Dict[str, Any]:
        """Finds the best matching transit hub in a given city by type"""
        from app.data.mock_db import CITY_HUBS, HUBS
        city_lower = city.strip().lower()
        candidates = CITY_HUBS.get(city_lower, [])
        if not candidates:
            candidates = [h for h in HUBS if city_lower in h.get("city", "").lower()]
        
        if candidates:
            for c in candidates:
                if c.get("type") == preferred_type:
                    return c
            return candidates[0]
        
        return {
            "id": f"hub_{city_lower[:3]}_{preferred_type[:4]}",
            "name": f"{city.title()} {preferred_type.replace('_', ' ').title()}",
            "city": city.title(),
            "type": preferred_type,
            "coordinates": {"lat": 12.97, "lng": 77.59}
        }

    @classmethod
    def build_custom_multimodal_legs(
        cls,
        origin: str = "Bengaluru",
        destination: str = "Chennai",
        requested_modes: Optional[List[str]] = None,
        departure_time: str = "06:00",
        date_str: str = "2026-10-13",
        max_budget: Optional[float] = None
    ) -> List[Dict[str, Any]]:
        """
        Dynamically constructs a 3-leg door-to-door multimodal itinerary based on user preferences.
        """
        def format_iso(minutes: int) -> str:
            h = (minutes // 60) % 24
            m = minutes % 60
            return f"{date_str}T{h:02d}:{m:02d}:00"

        req_modes = [m.lower() for m in (requested_modes or [])]
        
        # Decide intercity line-haul mode
        if any(m in req_modes for m in ["flight", "fly", "air", "plane"]):
            main_mode = "flight"
            hub_type = "airport"
            main_operator = "IndiGo 6E-243"
            main_class = "Economy (7kg cabin)"
            main_dur = 65
            main_fare = 3250
            buffer_1 = 95
            buffer_2 = 35
        elif "bus" in req_modes:
            main_mode = "bus"
            hub_type = "bus_terminal"
            main_operator = "KSRTC Airavat AC Sleeper"
            main_class = "AC Multi-Axle Sleeper"
            main_dur = 390
            main_fare = 850
            buffer_1 = 30
            buffer_2 = 25
        else:
            main_mode = "train"
            hub_type = "railway_station"
            main_operator = "20608 Vande Bharat Express"
            main_class = "AC Chair Car (CC)"
            main_dur = 265
            main_fare = 995
            buffer_1 = 35
            buffer_2 = 25

        # Decide first-mile mode
        if "metro" in req_modes:
            first_mode = "metro"
            first_op = f"{origin.title()} Metro Line"
            first_class = "Standard QR Transit"
            first_dur = 25
            first_fare = 40
        elif "auto" in req_modes and "cab" not in req_modes:
            first_mode = "auto"
            first_op = "Namma Yatri Auto"
            first_class = "Standard 3-Wheeler"
            first_dur = 30
            first_fare = 150
        else:
            first_mode = "cab"
            first_op = "UberGo Sedan"
            first_class = "Sedan (4 Seater)"
            first_dur = 55 if hub_type == "airport" else 30
            first_fare = 850 if hub_type == "airport" else 320

        # Decide last-mile mode
        if "metro" in req_modes and first_mode != "metro":
            last_mode = "metro"
            last_op = f"{destination.title()} Metro Line"
            last_class = "Standard QR Transit"
            last_dur = 25
            last_fare = 45
        elif "auto" in req_modes:
            last_mode = "auto"
            last_op = "Local City Auto"
            last_class = "Standard 3-Wheeler"
            last_dur = 25
            last_fare = 110
        else:
            last_mode = "cab"
            last_op = "Ola Prime Sedan"
            last_class = "Prime Sedan (4 Seater)"
            last_dur = 40 if hub_type == "airport" else 25
            last_fare = 450 if hub_type == "airport" else 220

        # Transit hubs
        orig_hub = cls.find_city_hub(origin, hub_type)
        dest_hub = cls.find_city_hub(destination, hub_type)

        home_pickup = {
            "id": f"addr_{origin.lower()[:3]}",
            "name": f"Home / Pickup Location ({origin.title()})",
            "city": origin.title(),
            "type": "address"
        }
        dest_dropoff = {
            "id": f"addr_{destination.lower()[:3]}",
            "name": f"Final Destination / Hotel ({destination.title()})",
            "city": destination.title(),
            "type": "address"
        }

        # Calculate chronological times
        dep_parts = departure_time.split(":")
        start_min = int(dep_parts[0]) * 60 + int(dep_parts[1]) if len(dep_parts) >= 2 else 360  # 06:00
        
        # Leg 1: Pickup -> Origin Hub
        l1_dep_m = start_min
        l1_arr_m = l1_dep_m + first_dur
        l1_dep = format_iso(l1_dep_m)
        l1_arr = format_iso(l1_arr_m)

        # Leg 2: Origin Hub -> Dest Hub
        l2_dep_m = l1_arr_m + buffer_1
        l2_arr_m = l2_dep_m + main_dur
        l2_dep = format_iso(l2_dep_m)
        l2_arr = format_iso(l2_arr_m)

        # Leg 3: Dest Hub -> Dropoff
        l3_dep_m = l2_arr_m + buffer_2
        l3_arr_m = l3_dep_m + last_dur
        l3_dep = format_iso(l3_dep_m)
        l3_arr = format_iso(l3_arr_m)

        leg1 = {
            "id": f"leg_mm_{uuid.uuid4().hex[:6]}_1",
            "mode": first_mode,
            "operator": first_op,
            "service_number": "First-Mile",
            "origin": home_pickup,
            "destination": orig_hub,
            "departure_time": l1_dep,
            "arrival_time": l1_arr,
            "duration_minutes": first_dur,
            "fare": first_fare,
            "class_or_category": first_class,
            "stops_count": 0,
            "seat_status": "Available"
        }

        leg2 = {
            "id": f"leg_mm_{uuid.uuid4().hex[:6]}_2",
            "mode": main_mode,
            "operator": main_operator,
            "service_number": "Main-Haul",
            "origin": orig_hub,
            "destination": dest_hub,
            "departure_time": l2_dep,
            "arrival_time": l2_arr,
            "duration_minutes": main_dur,
            "fare": main_fare,
            "class_or_category": main_class,
            "stops_count": 1 if main_mode == "train" else 0,
            "seat_status": "Available"
        }

        leg3 = {
            "id": f"leg_mm_{uuid.uuid4().hex[:6]}_3",
            "mode": last_mode,
            "operator": last_op,
            "service_number": "Last-Mile",
            "origin": dest_hub,
            "destination": dest_dropoff,
            "departure_time": l3_dep,
            "arrival_time": l3_arr,
            "duration_minutes": last_dur,
            "fare": last_fare,
            "class_or_category": last_class,
            "stops_count": 0,
            "seat_status": "Available"
        }

        return [leg1, leg2, leg3]
