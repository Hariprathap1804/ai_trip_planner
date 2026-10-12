"""
Multimodal Service: Chaining Legs, Transfer Buffers, and Compatibility Validation
"""

from typing import List, Dict, Any, Tuple
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
