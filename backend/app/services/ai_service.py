"""
AI Service: Provider-Independent NLP Engine with Groq Cloud AI and Deterministic Fallback
"""

import re
import json
import logging
from typing import Dict, Any, List, Optional
from app.config import settings
from app.services.journey_service import JourneyService, normalize_city
from app.services.multimodal_service import MultimodalService
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
You help users discover, filter, compare, plan, and book journeys across SIX transportation modes:
1. Flights
2. Trains
3. Metro
4. Buses
5. Cabs
6. Autos
And Multimodal journeys (combining cabs, high-speed rail, and metro).

Supported Hubs & Cities: Bengaluru, Chennai, Mumbai, Delhi, Hyderabad, Pune, Goa.

When the user asks something, you MUST return a valid JSON object strictly matching this schema:
{
  "reply_text": "Friendly, professional, helpful answer directly addressing the user's question.",
  "action_proposal": {
    "action": "search_journeys" | "apply_filters" | "sort_results" | "plan_multimodal_trip" | "quick_book" | "get_bookings" | "cancel_demo_booking",
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
  } or null,
  "suggested_followups": ["Question 1", "Question 2", "Question 3"]
}

CRITICAL RULES FOR ACTION PROPOSALS AND EDGE CASES:
1. Set "action_proposal" to null whenever the user asks unrelated questions, general chit-chat, greetings, or FAQ queries.
   - If the user asks general questions (e.g., "Hi", "How are you?", "What is the capital of France?", "Tell me a joke", "How does Razorpay work?", "What is multimodal travel?"):
     a) Answer their question directly and politely in "reply_text".
     b) Set "action_proposal": null.
     c) DO NOT invent or trigger any trip searches or bookings!
2. ONLY set "action_proposal" when the user explicitly requests to search, filter, plan, compare, or book travel journeys.
3. If the user wants to book immediately, quick book, reserve, or purchase a trip (e.g., 'Book flight to Chennai', 'Book cheapest train', 'Book this trip immediately', 'Quick book'), set action to 'quick_book'.
4. If user wants to cancel a booking, set action to 'cancel_demo_booking' and requires_user_confirmation: true.
5. Currency is Indian Rupee (₹). Never invent unavailable real flights/trains.
6. Output ONLY raw JSON without markdown code fences or backticks.
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
                if "reply_text" in parsed:
                    proposal = parsed.get("action_proposal")
                    if not proposal or not isinstance(proposal, dict) or not proposal.get("action"):
                        parsed["action_proposal"] = None
                        return parsed

                    p_action = proposal.get("action")
                    params = proposal.get("parameters", {})
                    
                    # Edge-case safety guard: If user prompt is purely conversational or lacks travel intent, cancel unwanted action proposal
                    prompt_lower = prompt.lower().strip()
                    clean_words = re.findall(r"\w+", prompt_lower)
                    is_pure_chitchat = (
                        prompt_lower in ["hi", "hello", "hey", "namaste", "good morning", "good afternoon", "good evening", "how are you", "who are you", "what can you do", "help", "thanks", "thank you", "bye"] or
                        (len(clean_words) <= 3 and any(w in ["hi", "hello", "hey", "thanks", "bye"] for w in clean_words))
                    )
                    has_travel_intent = (
                        any(city in prompt_lower for city in ["bengaluru", "bangalore", "chennai", "madras", "mumbai", "bombay", "delhi", "hyderabad", "pune", "goa"]) or
                        any(mode in prompt_lower for mode in ["flight", "fly", "air", "train", "rail", "vande bharat", "bus", "metro", "cab", "taxi", "uber", "auto", "rickshaw", "multimodal"]) or
                        any(verb in prompt_lower for verb in ["book", "reserve", "ticket", "travel", "journey", "trip", "itinerary", "route", "from", "to", "cheapest", "fastest", "budget", "pnr", "tp-", "cancel"])
                    )

                    if is_pure_chitchat or not has_travel_intent:
                        parsed["action_proposal"] = None
                        return parsed

                    is_quick_book = (
                        p_action == "quick_book" or
                        (
                            any(kw in prompt.lower() for kw in ["quick book", "book now", "book immediately", "instant book", "book a ", "book the ", "book me", "reserve", "buy ticket"])
                            and "my booking" not in prompt.lower()
                            and "cancel" not in prompt.lower()
                        )
                    )

                    is_multimodal = (
                        p_action == "plan_multimodal_trip" or
                        any(kw in prompt.lower() for kw in ["multimodal", "multi-modal", "multi modal", "door to door", "door-to-door", "combine", "chained"]) or
                        ("train" in prompt.lower() and "cab" in prompt.lower()) or
                        ("flight" in prompt.lower() and "cab" in prompt.lower()) or
                        ("bus" in prompt.lower() and "auto" in prompt.lower()) or
                        ("metro" in prompt.lower() and "train" in prompt.lower())
                    )
                    
                    if is_multimodal:
                        if not is_quick_book:
                            proposal["action"] = "plan_multimodal_trip"
                        orig = params.get("origin") or (current_search.get("origin") if current_search else "Bengaluru")
                        dest = params.get("destination") or (current_search.get("destination") if current_search else "Chennai")
                        req_m = params.get("modes") or []
                        
                        dep_t = "06:00"
                        dep_match = re.search(r"(?:depart(?:ing)?|start(?:ing)?|leave|at)\s*(?:around|at)?\s*(\d{1,2})(?::(\d{2}))?\s*(am|pm)?", prompt.lower())
                        if dep_match:
                            dh = int(dep_match.group(1))
                            dm = int(dep_match.group(2) or 0)
                            ampm = (dep_match.group(3) or "").lower()
                            if ampm == "pm" and dh < 12:
                                dh += 12
                            elif ampm == "am" and dh == 12:
                                dh = 0
                            dep_t = f"{dh:02d}:{dm:02d}"

                        legs = MultimodalService.build_custom_multimodal_legs(
                            origin=orig,
                            destination=dest,
                            requested_modes=req_m,
                            departure_time=dep_t,
                            max_budget=params.get("filters", {}).get("max_budget") if isinstance(params.get("filters"), dict) else None
                        )
                        comp_itinerary = MultimodalService.compose_multimodal_journey(legs)
                        
                        proposal["parameters"]["origin"] = orig
                        proposal["parameters"]["destination"] = dest
                        proposal["parameters"]["modes"] = comp_itinerary["modes"]
                        proposal["parameters"]["legs"] = legs
                        proposal["parameters"]["itinerary"] = comp_itinerary
                        proposal["parameters"]["journey"] = comp_itinerary
                        proposal["parameters"]["fare"] = comp_itinerary["total_fare"]
                        proposal["parameters"]["total_amount"] = round(comp_itinerary["total_fare"] * 1.12)
                        proposal["parameters"]["mode"] = "multimodal"
                        proposal["explanation"] = f"Generated {len(legs)}-leg multimodal itinerary ({' → '.join(m.title() for m in comp_itinerary['modes'])}) from {orig.title()} to {dest.title()}."

                    if is_quick_book:
                        proposal["action"] = "quick_book"
                        if not is_multimodal:
                            orig = params.get("origin") or (current_search.get("origin") if current_search else "Bengaluru")
                            dest = params.get("destination") or (current_search.get("destination") if current_search else "Chennai")
                            req_m = params.get("modes") or []
                            sort_opt = params.get("sort_by") or "recommended"

                            matches = await JourneyService.search_journeys(
                                origin=orig,
                                destination=dest,
                                modes=req_m if req_m else None,
                                sort_by=sort_opt
                            )
                            all_j = await DatabaseRepository.get_all_journeys()
                            selected_journey = matches[0] if matches else (all_j[0] if all_j else None)
                            if selected_journey:
                                base_fare = selected_journey.get("total_fare", 1000)
                                total_amt = round(base_fare * 1.12)
                                proposal["parameters"]["origin"] = selected_journey["origin"]["city"]
                                proposal["parameters"]["destination"] = selected_journey["destination"]["city"]
                                proposal["parameters"]["journey"] = selected_journey
                                proposal["parameters"]["fare"] = base_fare
                                proposal["parameters"]["total_amount"] = total_amt
                                proposal["parameters"]["mode"] = selected_journey["modes"][0] if len(selected_journey["modes"]) == 1 else "multimodal"
                                proposal["explanation"] = f"Quick Book: {selected_journey['origin']['city']} → {selected_journey['destination']['city']} ({selected_journey['legs'][0].get('operator', 'Transit')}, ₹{total_amt:,}). Click Book & Pay to open Razorpay immediately."
                        
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

        # 1. Greetings & Pleasantries
        clean_words = re.findall(r"\w+", text)
        is_greeting = (
            text in ["hi", "hello", "hey", "namaste", "good morning", "good afternoon", "good evening", "howdy", "greetings"] or
            any(text == g or text.startswith(g + " ") or text.endswith(" " + g) for g in ["hi", "hello", "hey", "namaste"]) or
            any(g in text for g in ["good morning", "good afternoon", "good evening", "how are you", "how r u", "what's up", "whats up"])
        )
        has_explicit_travel_action = any(kw in text for kw in ["book", "flight", "train", "bus", "cab", "metro", "auto", "from", "to", "ticket", "pnr", "tp-"])

        if is_greeting and not has_explicit_travel_action:
            return {
                "reply_text": (
                    "Hello! I am **TripPilot AI**, your multimodal travel copilot for India. ✈️🚆🚌\n\n"
                    "I can help you search, compare, plan, and book door-to-door trips across **Flights, Trains, Buses, Metro, Cabs, and Autos** with instant Razorpay test checkout.\n\n"
                    "How can I assist your travels today?"
                ),
                "action_proposal": None,
                "suggested_followups": [
                    "Book the cheapest flight from Bengaluru to Chennai",
                    "Plan a multimodal trip with train and cab",
                    "What can you do?",
                    "Show my bookings"
                ]
            }

        # 2. Gratitude & Farewells
        if any(kw in text for kw in ["thank you", "thanks", "thx", "appreciate it", "great thanks"]) and not has_explicit_travel_action:
            return {
                "reply_text": "You're very welcome! If you need any more recommendations, fare comparisons, or route planning, feel free to ask anytime.",
                "action_proposal": None,
                "suggested_followups": [
                    "Find flights from Bengaluru to Delhi",
                    "Plan a multimodal trip",
                    "What transit modes are supported?"
                ]
            }

        if any(kw in text for kw in ["bye", "goodbye", "see you", "cya", "exit"]) and len(clean_words) <= 3:
            return {
                "reply_text": "Safe travels! Whenever you're ready to plan your next journey, I'll be right here.",
                "action_proposal": None,
                "suggested_followups": ["Book a trip", "Show my bookings"]
            }

        # 3. Help, Capabilities & Identity
        if any(kw in text for kw in ["who are you", "what can you do", "what is trippilot", "help me", "how to use", "what are your features", "what do you do", "features"]) or text == "help":
            return {
                "reply_text": (
                    "I am **TripPilot AI**, an intelligent conversational travel assistant for India. Here is what I can do for you:\n\n"
                    "• ✈️ **Unified 6-Mode Search:** Search and compare Flights, Trains, Buses, Metro, Cabs, and Autos.\n"
                    "• 🔀 **Multimodal Itineraries:** Automatically compose chained door-to-door routes (e.g. Cab ➔ Vande Bharat Train ➔ Metro) with transfer buffer guarantees.\n"
                    "• 💳 **Instant Quick Booking:** Ask me to book any flight or train, and I'll launch direct Razorpay payment right in the chat.\n"
                    "• 🔍 **Smart Filters & Sorting:** Filter by budget (e.g. *under ₹5,000*), non-stop flights, AC buses, and departure time slots.\n"
                    "• 🎫 **Booking Management:** Review confirmed travel passes and manage cancellations.\n\n"
                    "Try asking: *'Book the cheapest flight from Bengaluru to Chennai'* or *'Plan a multimodal trip with train and cab'*!"
                ),
                "action_proposal": None,
                "suggested_followups": [
                    "Book the cheapest flight to Chennai",
                    "Plan a multimodal trip",
                    "How does Razorpay payment work?"
                ]
            }

        # 4. FAQs: Razorpay & Payment Gateway
        if any(kw in text for kw in ["how does payment work", "what is razorpay", "is payment real", "payment method", "how do i pay", "test mode", "test card", "payment"]):
            return {
                "reply_text": (
                    "TripPilot AI is integrated with the **Razorpay Payment Gateway in Test Mode**:\n\n"
                    "• 💳 **Test Cards:** You can use sandbox card `4111 1111 1111 1111` (any future expiry, CVV `123`, OTP `123456`).\n"
                    "• 📱 **Test UPI:** Use `success@razorpay` or scan the sandbox QR code.\n"
                    "• 🔒 **Security:** Every transaction creates a server order in paise and cryptographically verifies the HMAC-SHA256 signature.\n"
                    "• 🛡️ **Zero Real Charges:** This is a safe testing sandbox; no real money or bank accounts will ever be charged."
                ),
                "action_proposal": None,
                "suggested_followups": [
                    "Book a flight using Razorpay Test",
                    "How does multimodal planning work?",
                    "View my bookings"
                ]
            }

        # 5. FAQs: Multimodal Travel
        if any(kw in text for kw in ["what is multimodal", "how does multimodal work", "explain multimodal", "what are multimodal journeys"]):
            return {
                "reply_text": (
                    "**Multimodal travel** combines multiple transit types into one synchronized journey:\n\n"
                    "Instead of just booking a single flight or train, TripPilot AI chains together:\n"
                    "1. **First-Mile:** Local auto or on-demand cab from your home to the transit hub.\n"
                    "2. **Line-Haul:** Express flight or Vande Bharat high-speed train for the intercity leg.\n"
                    "3. **Last-Mile:** City metro or cab connection to your final doorstep.\n\n"
                    "Our engine automatically calculates and verifies transfer buffers (e.g. 90 mins for flights, 30 mins for trains) so you never miss a connection."
                ),
                "action_proposal": None,
                "suggested_followups": [
                    "Plan a multimodal trip from Bengaluru to Chennai",
                    "Book the fastest train to Chennai",
                    "Show my bookings"
                ]
            }

        # 6. FAQs: Baggage
        if any(kw in text for kw in ["baggage", "luggage", "cabin bag", "check in bag"]):
            return {
                "reply_text": (
                    "Here are the standard baggage guidelines across our simulated carriers:\n\n"
                    "• ✈️ **Flights (IndiGo, Air India, Akasa):** 7 kg Cabin Baggage + 15 kg Check-in Baggage included in Economy.\n"
                    "• 🚆 **Trains (IRCTC / Vande Bharat):** Up to 40 kg per passenger in AC Chair Car / Executive.\n"
                    "• 🚌 **Intercity Buses:** Up to 2 pieces of medium luggage in the under-deck hold.\n"
                    "• 🚕 **Cabs & Autos:** 2–3 suitcases for Sedans/SUVs, handheld bags for Autos."
                ),
                "action_proposal": None,
                "suggested_followups": [
                    "Search flights to Chennai",
                    "Plan a multimodal trip",
                    "How does payment work?"
                ]
            }

        # 7. Booking Management Intents (Cancel / View)
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

        # 8. Unrelated / General Non-Travel Query Guard
        has_travel_keywords = (
            any(city in text for city in ["bengaluru", "bangalore", "chennai", "madras", "mumbai", "bombay", "delhi", "hyderabad", "pune", "goa"]) or
            any(mode in text for mode in ["flight", "fly", "air", "plane", "train", "rail", "vande bharat", "bus", "metro", "cab", "taxi", "uber", "auto", "rickshaw", "multimodal"]) or
            any(verb in text for verb in ["book", "reserve", "ticket", "travel", "journey", "trip", "itinerary", "route", "from", "to", "cheapest", "fastest", "budget", "pnr", "tp-"])
        )

        if not has_travel_keywords:
            return {
                "reply_text": (
                    "I am **TripPilot AI**, your dedicated multimodal travel assistant for India.\n\n"
                    "I specialize in searching, planning, comparing, and booking journeys across **Flights, Trains, Buses, Metro, Cabs, and Autos** (including instant Razorpay checkout and door-to-door multimodal itineraries).\n\n"
                    "While I focus on travel, let me know if you would like me to find routes, compare fares between cities, or book a trip for you!"
                ),
                "action_proposal": None,
                "suggested_followups": [
                    "Book the cheapest flight from Bengaluru to Chennai",
                    "Plan a multimodal trip with train and cab",
                    "What can you do?",
                    "How does Razorpay work?"
                ]
            }

        # 9. Extract Origin and Destination
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

        # 10. Extract Budget
        max_budget = None
        budget_match = re.search(r"(?:under|below|less than|max(?:imum)?)\s*(?:₹|rs\.?|inr)?\s*(\d+)", text)
        if budget_match:
            max_budget = float(budget_match.group(1))

        # 11. Extract Modes
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

        # 7. Check Quick Booking vs Planning Intent
        is_quick_booking_intent = (
            any(kw in text for kw in [
                "quick book", "book now", "book immediately", "instant book",
                "book this", "book a ", "book the ", "book me", "reserve a", "reserve the",
                "buy ticket", "pay and book"
            ]) or (text.startswith("book ") and "booking" not in text)
        )

        is_multimodal_prompt = (
            "multimodal" in text or "door to door" in text or "door-to-door" in text or 
            "multi modal" in text or "multi-modal" in text or
            ("train" in text and "cab" in text) or
            ("flight" in text and "cab" in text) or
            ("bus" in text and "auto" in text) or
            ("metro" in text and "train" in text) or
            ("cab" in text and "auto" in text) or
            ("flight" in text and "train" in text)
        )
        if is_multimodal_prompt:
            dep_t = "06:00"
            dep_match = re.search(r"(?:depart(?:ing)?|start(?:ing)?|leave|at)\s*(?:around|at)?\s*(\d{1,2})(?::(\d{2}))?\s*(am|pm)?", text)
            if dep_match:
                dh = int(dep_match.group(1))
                dm = int(dep_match.group(2) or 0)
                ampm = (dep_match.group(3) or "").lower()
                if ampm == "pm" and dh < 12:
                    dh += 12
                elif ampm == "am" and dh == 12:
                    dh = 0
                dep_t = f"{dh:02d}:{dm:02d}"

            legs = MultimodalService.build_custom_multimodal_legs(
                origin=origin,
                destination=destination,
                requested_modes=detected_modes,
                departure_time=dep_t,
                max_budget=max_budget
            )
            comp_itinerary = MultimodalService.compose_multimodal_journey(legs)
            modes_chain = " → ".join(m.title() for m in comp_itinerary["modes"])
            dur_h = comp_itinerary["total_duration_minutes"] // 60
            dur_m = comp_itinerary["total_duration_minutes"] % 60
            total_amt = round(comp_itinerary["total_fare"] * 1.12)
            
            leg_summaries = []
            for idx, l in enumerate(legs):
                dep_t = l["departure_time"].split("T")[1][:5]
                arr_t = l["arrival_time"].split("T")[1][:5]
                leg_summaries.append(f"{idx+1}. {l['operator']} ({l['mode'].title()}): {l['origin']['name']} ➔ {l['destination']['name']} ({dep_t}–{arr_t}, ₹{l['fare']:,})")

            if is_quick_booking_intent:
                reply = (
                    f"I've configured your {len(legs)}-leg multimodal journey from **{origin.title()}** to **{destination.title()}** for **Immediate Quick Booking**:\n\n"
                    + "\n".join(leg_summaries)
                    + f"\n\n**Total Door-to-Door Duration:** {dur_h}h {dur_m}m | **Total Fare Due:** ₹{total_amt:,} (Base ₹{comp_itinerary['total_fare']:,} + 12% Taxes)\n\n"
                    + "Click **Book & Pay with Razorpay** below to open the checkout gateway immediately and confirm your ticket."
                )
                return {
                    "reply_text": reply,
                    "action_proposal": {
                        "action": "quick_book",
                        "parameters": {
                            "origin": origin.title(),
                            "destination": destination.title(),
                            "modes": comp_itinerary["modes"],
                            "legs": legs,
                            "itinerary": comp_itinerary,
                            "journey": comp_itinerary,
                            "fare": comp_itinerary["total_fare"],
                            "total_amount": total_amt,
                            "mode": "multimodal"
                        },
                        "explanation": f"Quick Book {len(legs)}-leg Multimodal Route ({modes_chain}, ₹{total_amt:,}) directly with Razorpay.",
                        "requires_user_confirmation": False
                    },
                    "suggested_followups": [
                        "Open Trip Planner to customize",
                        "Switch to direct flight",
                        "View my bookings"
                    ]
                }
            
            reply = (
                f"I've composed a custom {len(legs)}-leg multimodal itinerary from **{origin.title()}** to **{destination.title()}**:\n\n"
                + "\n".join(leg_summaries)
                + f"\n\n**Total Door-to-Door Duration:** {dur_h}h {dur_m}m | **Total Fare:** ₹{comp_itinerary['total_fare']:,} | **Transfers:** {comp_itinerary['transfers_count']}\n\n"
                + "You can view, edit, or reorder these legs directly in the Multimodal Trip Planner."
            )
            return {
                "reply_text": reply,
                "action_proposal": {
                    "action": "plan_multimodal_trip",
                    "parameters": {
                        "origin": origin.title(),
                        "destination": destination.title(),
                        "modes": comp_itinerary["modes"],
                        "legs": legs,
                        "itinerary": comp_itinerary
                    },
                    "explanation": f"Composed {len(legs)}-leg multimodal itinerary ({modes_chain}) from {origin.title()} to {destination.title()}.",
                    "requires_user_confirmation": False
                },
                "suggested_followups": [
                    "Open Trip Planner to customize",
                    "Book this multimodal trip",
                    "Switch to direct flight"
                ]
            }

        if is_quick_booking_intent:
            matches = await JourneyService.search_journeys(
                origin=origin,
                destination=destination,
                modes=detected_modes if detected_modes else None,
                sort_by=sort_by
            )
            all_j = await DatabaseRepository.get_all_journeys()
            selected_journey = matches[0] if matches else (all_j[0] if all_j else None)
            if selected_journey:
                base_fare = selected_journey.get("total_fare", 1000)
                taxes = round(base_fare * 0.12)
                total_amt = round(base_fare + taxes)
                operator_name = selected_journey['legs'][0].get('operator', 'Express Transit')
                mode_label = " + ".join(m.title() for m in selected_journey.get('modes', ['flight']))
                dep_time_str = selected_journey['departure_time'].split('T')[1][:5] if 'T' in selected_journey['departure_time'] else selected_journey['departure_time']
                arr_time_str = selected_journey['arrival_time'].split('T')[1][:5] if 'T' in selected_journey['arrival_time'] else selected_journey['arrival_time']
                dur_h = selected_journey['total_duration_minutes'] // 60
                dur_m = selected_journey['total_duration_minutes'] % 60

                reply = (
                    f"Here is your selected trip ready for **Immediate Quick Booking**:\n\n"
                    f"✈️ **{operator_name}** ({mode_label})\n"
                    f"📍 **{selected_journey['origin']['city']}** ({selected_journey['origin']['name']}) ➔ **{selected_journey['destination']['city']}** ({selected_journey['destination']['name']})\n"
                    f"⏱️ **Departure:** {dep_time_str} | **Arrival:** {arr_time_str} ({dur_h}h {dur_m}m)\n"
                    f"💳 **Total Amount Due:** ₹{total_amt:,} (Base ₹{base_fare:,} + Taxes & Fees)\n\n"
                    f"Click **Book & Pay via Razorpay** below to open the checkout gateway immediately and secure your ticket."
                )

                return {
                    "reply_text": reply,
                    "action_proposal": {
                        "action": "quick_book",
                        "parameters": {
                            "origin": selected_journey['origin']['city'],
                            "destination": selected_journey['destination']['city'],
                            "journey": selected_journey,
                            "fare": base_fare,
                            "total_amount": total_amt,
                            "mode": selected_journey['modes'][0] if len(selected_journey['modes']) == 1 else "multimodal"
                        },
                        "explanation": f"Quick Book {operator_name} ({selected_journey['origin']['city']} → {selected_journey['destination']['city']}, ₹{total_amt:,}) directly with Razorpay.",
                        "requires_user_confirmation": False
                    },
                    "suggested_followups": [
                        "Show alternative flights",
                        "Show cheaper trains",
                        "View door-to-door multimodal route"
                    ]
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
