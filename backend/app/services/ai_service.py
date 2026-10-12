"""
AI Service: Provider-Independent NLP Engine, Action Proposal, and State Synchronizer
"""

import re
from typing import Dict, Any, List, Optional
from app.services.journey_service import JourneyService, normalize_city
from app.supabase_client import DatabaseRepository

class AIService:

    @classmethod
    async def process_user_prompt(
        cls,
        prompt: str,
        current_search: Optional[Dict[str, Any]] = None,
        active_filters: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Parses user natural language query, extracts intent, and maps to structured actions.
        """
        text = prompt.strip().lower()

        # 1. Booking Management Intents
        if "cancel" in text and ("booking" in text or "tp-" in text):
            match = re.search(r"tp-\d{6}", text, re.IGNORECASE)
            ref_number = match.group(0).upper() if match else "TP-849201"
            return {
                "reply_text": f"I can help you cancel demo booking {ref_number}. Please confirm if you wish to proceed.",
                "action_proposal": {
                    "action": "cancel_demo_booking",
                    "parameters": {"reference_number": ref_number},
                    "explanation": f"Request cancellation for simulated booking {ref_number}.",
                    "requires_user_confirmation": True
                },
                "suggested_followups": ["Confirm cancellation", "Keep my booking", "View my active bookings"]
            }

        if "my booking" in text or "show bookings" in text or "upcoming trip" in text:
            bookings = await DatabaseRepository.get_bookings()
            active_count = len([b for b in bookings if b.get("status") == "CONFIRMED"])
            return {
                "reply_text": f"You currently have {active_count} active simulated bookings in your account.",
                "action_proposal": {
                    "action": "get_bookings",
                    "parameters": {},
                    "explanation": "Navigate to My Bookings dashboard.",
                    "requires_user_confirmation": False
                },
                "suggested_followups": ["View all bookings", "Book a new trip", "Cancel recent booking"]
            }

        # 2. Extract Origin and Destination
        origin = None
        destination = None

        # Pattern: from X to Y
        from_to_match = re.search(r"from\s+([a-zA-Z\s]+?)\s+to\s+([a-zA-Z\s]+?)(?:$|\s+tomorrow|\s+under|\s+before|\s+with|\s+in)", text)
        if from_to_match:
            origin = from_to_match.group(1).strip()
            destination = from_to_match.group(2).strip()
        else:
            # Pattern: to Y from X
            to_from_match = re.search(r"to\s+([a-zA-Z\s]+?)\s+from\s+([a-zA-Z\s]+?)(?:$|\s+tomorrow|\s+under|\s+before|\s+with|\s+in)", text)
            if to_from_match:
                destination = to_from_match.group(1).strip()
                origin = to_from_match.group(2).strip()
        
        # Fallback to current search if not specified in prompt
        if not origin and current_search and current_search.get("origin"):
            origin = current_search["origin"]
        if not destination and current_search and current_search.get("destination"):
            destination = current_search["destination"]

        # Default fallback if still blank
        if not origin:
            origin = "Bengaluru"
        if not destination:
            destination = "Chennai"

        # 3. Extract Budget
        max_budget = None
        budget_match = re.search(r"(?:under|below|less than|max(?:imum)?)\s*(?:₹|rs\.?|inr)?\s*(\d+)", text)
        if budget_match:
            max_budget = float(budget_match.group(1))

        # 4. Extract Modes
        detected_modes = []
        if "flight" in text or "fly" in text or "air" in text:
            detected_modes.append("flight")
        if "train" in text or "rail" in text or "vande bharat" in text:
            detected_modes.append("train")
        if "bus" in text:
            detected_modes.append("bus")
        if "metro" in text:
            detected_modes.append("metro")
        if "cab" in text or "taxi" in text or "uber" in text:
            detected_modes.append("cab")
        if "auto" in text or "rickshaw" in text:
            detected_modes.append("auto")

        # 5. Extract Arrival Deadline
        arrival_before = None
        arr_match = re.search(r"arrive\s*(?:before|by)\s*(\d{1,2}(?::\d{2})?\s*(?:am|pm)?)", text)
        if arr_match:
            arrival_before = arr_match.group(1).upper()

        # 6. Extract Sorting / Optimization
        sort_by = "recommended"
        if "cheapest" in text or "lowest price" in text or "budget" in text:
            sort_by = "cheapest"
        elif "fastest" in text or "quickest" in text or "shortest" in text:
            sort_by = "fastest"
        elif "earliest" in text:
            sort_by = "earliest_arrival"

        # 7. Check if Multimodal Plan
        if "multimodal" in text or "door to door" in text or ("train" in text and "cab" in text):
            return {
                "reply_text": f"I've structured a multimodal itinerary combining cab transfers and high-speed rail between {origin.title()} and {destination.title()} to optimize comfort and connection times.",
                "action_proposal": {
                    "action": "plan_multimodal_trip",
                    "parameters": {
                        "origin": origin,
                        "destination": destination,
                        "modes": ["cab", "train", "cab"]
                    },
                    "explanation": f"Compose door-to-door multimodal itinerary for {origin.title()} to {destination.title()}.",
                    "requires_user_confirmation": False
                },
                "suggested_followups": ["View multimodal timeline", "Compare with direct flight", "Book this itinerary"]
            }

        # 8. Standard Journey Search & Filter Proposal
        applied_filters = {}
        if max_budget:
            applied_filters["max_budget"] = max_budget
        if "direct" in text or "non stop" in text:
            applied_filters["flight_direct_only"] = True
            applied_filters["max_transfers"] = 0
        if "ac" in text:
            applied_filters["bus_ac_only"] = True

        # Run query to find actual matching sample
        matches = await JourneyService.search_journeys(
            origin=origin,
            destination=destination,
            modes=detected_modes if detected_modes else None,
            sort_by=sort_by
        )
        match_count = len(matches)

        response_parts = [
            f"Found {match_count} options from **{origin.title()}** to **{destination.title()}**."
        ]
        if detected_modes:
            response_parts.append(f"Filtered to: {', '.join(m.title() for m in detected_modes)}.")
        if max_budget:
            response_parts.append(f"Capped budget under ₹{int(max_budget):,}.")
        if arrival_before:
            response_parts.append(f"Prioritizing arrival before {arrival_before}.")
        if sort_by != "recommended":
            response_parts.append(f"Sorted by {sort_by.replace('_', ' ')}.")

        reply_text = " ".join(response_parts)

        return {
            "reply_text": reply_text,
            "action_proposal": {
                "action": "search_journeys",
                "parameters": {
                    "origin": origin.title(),
                    "destination": destination.title(),
                    "modes": detected_modes if detected_modes else ["flight", "train", "bus", "metro", "cab", "auto"],
                    "filters": applied_filters,
                    "sort_by": sort_by
                },
                "explanation": f"Applied search and filters for {origin.title()} → {destination.title()}.",
                "requires_user_confirmation": False
            },
            "suggested_followups": [
                f"Show only cheapest under ₹{int(max_budget or 1500)}",
                "Plan multimodal trip with cab and train",
                "Show fastest option",
                "Arrive before 10 AM"
            ]
        }
