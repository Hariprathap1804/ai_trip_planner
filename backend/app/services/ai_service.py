"""
AI Service: Provider-Independent NLP Engine with Groq Cloud AI and Deterministic Fallback
"""

import re
import json
import logging
from typing import Dict, Any, List, Optional
from app.config import settings
from app.services.journey_service import JourneyService, normalize_city
from app.supabase_client import DatabaseRepository

logger = logging.getLogger(__name__)

groq_client = None
if settings.GROQ_API_KEY:
    try:
        from groq import Groq
        groq_client = Groq(api_key=settings.GROQ_API_KEY)
        logger.info(f"Groq Cloud AI initialized with model: {settings.GROQ_MODEL}")
    except Exception as e:
        logger.warning(f"Could not initialize Groq SDK: {e}")
        groq_client = None

SYSTEM_PROMPT = """You are TripPilot AI, an intelligent conversational multimodal travel companion for India.
You help users discover, filter, compare, and plan journeys across SIX transportation modes:
1. Flights
2. Trains
3. Metro
4. Buses
5. Cabs
6. Autos
And Multimodal journeys (combining cabs, high-speed rail, and metro).

Supported Hubs & Cities: Bengaluru, Chennai, Mumbai, Delhi, Hyderabad, Pune, Goa.

When the user gives a travel request, you MUST return a valid JSON object strictly matching this schema:
{
  "reply_text": "Friendly, professional explanation of recommendations and actions taken.",
  "action_proposal": {
    "action": "search_journeys" | "apply_filters" | "sort_results" | "plan_multimodal_trip" | "get_bookings" | "cancel_demo_booking",
    "parameters": {
      "origin": "City Name (e.g. Bengaluru)",
      "destination": "City Name (e.g. Chennai)",
      "modes": ["flight", "train", "bus", "metro", "cab", "auto"],
      "filters": {
        "max_budget": number or null,
        "flight_direct_only": boolean or null,
        "bus_ac_only": boolean or null,
        "time_of_day": ["early_morning" | "morning" | "afternoon" | "evening"] or null
      },
      "sort_by": "recommended" | "cheapest" | "fastest" | "earliest_arrival",
      "reference_number": "TP-XXXXXX" (only if cancel action)
    },
    "explanation": "Clear summary of the action to be applied to the website",
    "requires_user_confirmation": false (true only for cancel actions)
  },
  "suggested_followups": ["Question 1", "Question 2", "Question 3"]
}

Important Rules:
- Currency is Indian Rupee (₹).
- Never invent unavailable real flights/trains. Stay within simulated travel bounds.
- If user wants to cancel a booking, set action to "cancel_demo_booking" and requires_user_confirmation: true.
- Output ONLY raw JSON without markdown code fences or backticks.
"""

class AIService:

    @classmethod
    async def process_user_prompt(
        cls,
        prompt: str,
        current_search: Optional[Dict[str, Any]] = None,
        active_filters: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Routes user query to Groq Cloud AI if configured; otherwise uses deterministic parser.
        """
        if groq_client and settings.GROQ_API_KEY:
            try:
                logger.info("Processing user prompt via Groq Cloud AI...")
                context_str = f"Current User State: Origin={current_search.get('origin', 'Bengaluru') if current_search else 'Bengaluru'}, Destination={current_search.get('destination', 'Chennai') if current_search else 'Chennai'}."
                
                completion = groq_client.chat.completions.create(
                    model=settings.GROQ_MODEL,
                    messages=[
                        {"role": "system", "content": SYSTEM_PROMPT},
                        {"role": "user", "content": f"{context_str}\nUser Prompt: {prompt}"}
                    ],
                    response_format={"type": "json_object"},
                    temperature=0.2,
                    max_tokens=1000
                )
                
                raw_json = completion.choices[0].message.content
                parsed = json.loads(raw_json)
                
                # Validate response structure
                if "reply_text" in parsed and "action_proposal" in parsed:
                    return parsed
            except Exception as e:
                logger.warning(f"Groq Cloud AI processing failed or timed out: {e}. Falling back to deterministic engine.")

        # High-precision deterministic parser fallback
        return await cls._deterministic_parse(prompt, current_search, active_filters)

    @classmethod
    async def _deterministic_parse(
        cls,
        prompt: str,
        current_search: Optional[Dict[str, Any]] = None,
        active_filters: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
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

        from_to_match = re.search(r"from\s+([a-zA-Z\s]+?)\s+to\s+([a-zA-Z\s]+?)(?:$|\s+tomorrow|\s+under|\s+before|\s+with|\s+in)", text)
        if from_to_match:
            origin = from_to_match.group(1).strip()
            destination = from_to_match.group(2).strip()
        else:
            to_from_match = re.search(r"to\s+([a-zA-Z\s]+?)\s+from\s+([a-zA-Z\s]+?)(?:$|\s+tomorrow|\s+under|\s+before|\s+with|\s+in)", text)
            if to_from_match:
                destination = to_from_match.group(1).strip()
                origin = to_from_match.group(2).strip()
        
        if not origin and current_search and current_search.get("origin"):
            origin = current_search["origin"]
        if not destination and current_search and current_search.get("destination"):
            destination = current_search["destination"]

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

        # 6. Extract Sorting
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
                        "origin": origin.title(),
                        "destination": destination.title(),
                        "modes": ["cab", "train", "cab"]
                    },
                    "explanation": f"Compose door-to-door multimodal itinerary for {origin.title()} to {destination.title()}.",
                    "requires_user_confirmation": False
                },
                "suggested_followups": ["View multimodal timeline", "Compare with direct flight", "Book this itinerary"]
            }

        # 8. Standard Journey Search
        applied_filters = {}
        if max_budget:
            applied_filters["max_budget"] = max_budget
        if "direct" in text or "non stop" in text:
            applied_filters["flight_direct_only"] = True
            applied_filters["max_transfers"] = 0
        if "ac" in text:
            applied_filters["bus_ac_only"] = True

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
