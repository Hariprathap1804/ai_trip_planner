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

SYSTEM_PROMPT = """You are TripPilot AI, a knowledgeable, friendly, and professional conversational travel companion for India.
You help travelers discover, filter, compare, plan, and book journeys across SIX transportation modes:
1. Flights
2. Trains
3. Metro
4. Buses
5. Cabs
6. Autos
And connected Multimodal journeys (synchronizing first-mile cabs/autos, line-haul flights/trains, and last-mile metro/cabs).

Supported Cities & Transit Hubs: Bengaluru, Chennai, Mumbai, Delhi, Hyderabad, Pune, Goa.

TONE & BEHAVIOR GUIDELINES:
- Conversational, concise, professional, and helpful.
- Explain recommendations in plain English grounded strictly in actual journey data.
- Clearly distinguish between suggesting an action, executing it, and confirming that it succeeded.
- For consequential actions (like booking cancellation), ALWAYS set "requires_user_confirmation": true and explain what will happen before proceeding.
- When origin, destination, or dates are missing or ambiguous, politely ask clarifying questions to help the traveler narrow down their options.
- If the user asks about payments, explain that TripPilot AI integrates securely with Razorpay (UPI, Cards, NetBanking) with 256-bit SSL encryption.
- If evaluation/demonstration mode is relevant, clearly communicate prototype boundaries without sounding broken or confusing.
- Never invent unavailable carriers, imaginary flights, fake train schedules, or completed actions.

SCHEMA CONTRACT:
Return a valid JSON object strictly matching this schema:
{
  "reply_text": "Friendly, professional, helpful answer directly addressing the user's request.",
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
    "explanation": "Plain-English summary of the action suggested or applied",
    "requires_user_confirmation": false (true only for cancel actions)
  } or null,
  "suggested_followups": ["Question 1", "Question 2", "Question 3"]
}

CRITICAL RULES FOR ACTION PROPOSALS AND EDGE CASES:
1. Set "action_proposal" to null whenever the user asks unrelated questions, general chit-chat, greetings, or FAQ queries.
   - If the user asks general questions (e.g., "Hi", "How are you?", "What can you do?", "Tell me a joke", "How does payment work?", "What is multimodal travel?"):
     a) Answer their question directly, warmly, and helpfully in "reply_text".
     b) Set "action_proposal": null.
     c) DO NOT trigger any trip searches or bookings!
2. ONLY set "action_proposal" when the user explicitly requests to search, filter, plan, compare, or book travel journeys.
3. If the user wants to book immediately, quick book, reserve, or purchase a trip (e.g., 'Book flight to Chennai', 'Book cheapest train', 'Book this trip immediately', 'Quick book'), set action to 'quick_book'.
4. If the user wants to cancel a booking, set action to 'cancel_demo_booking' and requires_user_confirmation: true.
5. Currency is Indian Rupee (₹).
6. Output ONLY raw JSON without markdown code fences or backticks.
"""

class AIService:

    @classmethod
    async def process_user_prompt(
        cls,
        prompt: str,
        current_search: Optional[Dict[str, Any]] = None,
        active_filters: Optional[Dict[str, Any]] = None,
        user_id: Optional[str] = None,
        user_email: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Routes user query to Groq Cloud AI if configured; otherwise uses deterministic parser.
        Enforces user boundary context on personal bookings queries.
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

                    if p_action == "get_bookings":
                        if not user_id and not user_email:
                            parsed["reply_text"] = "Please sign in to your TripPilot AI account to view and manage your travel bookings."
                            proposal["action"] = "open_login"
                            proposal["parameters"] = {}
                            proposal["explanation"] = "Sign in to access your travel bookings."
                        else:
                            bookings = await DatabaseRepository.get_bookings_by_user(user_id=user_id or "", email=user_email or "")
                            active_count = len([b for b in bookings if b.get("status") == "CONFIRMED"])
                            parsed["reply_text"] = f"You currently have {active_count} confirmed booking{'s' if active_count != 1 else ''} in your account. You can view full ticket details and manage itineraries in your bookings dashboard."
                    
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
                                proposal["explanation"] = f"Quick Book: {selected_journey['origin']['city']} → {selected_journey['destination']['city']} ({selected_journey['legs'][0].get('operator', 'Transit')}, ₹{total_amt:,}). Review itinerary and proceed to secure checkout."
                        
                    return parsed
            except Exception as e:
                logger.warning(f"Groq Cloud AI processing failed or timed out: {e}. Falling back to deterministic engine.")

        # High-precision deterministic parser fallback
        return await cls._deterministic_parse(prompt, current_search, active_filters, user_id=user_id, user_email=user_email)

    @classmethod
    async def _deterministic_parse(
        cls,
        prompt: str,
        current_search: Optional[Dict[str, Any]] = None,
        active_filters: Optional[Dict[str, Any]] = None,
        user_id: Optional[str] = None,
        user_email: Optional[str] = None
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
                    "Hello! I'm your **TripPilot AI** travel companion. ✈️🚆🚌\n\n"
                    "I can help you search, compare, plan, and book journeys across **Flights, Trains, Buses, Metro, Cabs, and Autos** with seamless door-to-door connections.\n\n"
                    "Where are you planning to travel, and what matters most for your trip—speed, budget, or comfort?"
                ),
                "action_proposal": None,
                "suggested_followups": [
                    "Find the cheapest train from Bengaluru to Chennai",
                    "Plan a multimodal trip with train and cab",
                    "Show direct flights under ₹5,000",
                    "What can you do?"
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
                    "I am **TripPilot AI**, your intelligent conversational travel companion for India. Here is how I can make your travel seamless:\n\n"
                    "• ✈️ **Unified 6-Mode Search:** Compare flights, trains, buses, metro, cabs, and autos all in one place.\n"
                    "• 🔀 **Door-to-Door Multimodal Routes:** Automatically assemble connected journeys (e.g., Cab ➔ High-speed Train ➔ Metro) with verified transfer buffers.\n"
                    "• 🔍 **Tailored Filters & Sorting:** Narrow options by your budget cap, non-stop flights, AC buses, and arrival deadlines.\n"
                    "• 💳 **Fast & Secure Booking:** Select your journey and proceed smoothly with verified Razorpay checkout.\n"
                    "• 🎫 **Booking Management:** Check confirmed itineraries, review ticket details, or request cancellations.\n\n"
                    "Try asking: *'Find the cheapest morning train to Chennai under ₹1,000'* or *'Plan a door-to-door trip combining a train and a cab'*!"
                ),
                "action_proposal": None,
                "suggested_followups": [
                    "Book the cheapest flight to Chennai",
                    "Plan a multimodal trip",
                    "How does payment work?"
                ]
            }

        # 4. FAQs: Razorpay & Payment Gateway
        if any(kw in text for kw in ["how does payment work", "what is razorpay", "is payment real", "payment method", "how do i pay", "test mode", "test card", "payment"]):
            return {
                "reply_text": (
                    "TripPilot AI is integrated with the **Razorpay Payment Gateway**:\n\n"
                    "• 💳 **Multiple Payment Options:** Complete transactions using UPI (Google Pay, PhonePe, Paytm, BHIM), Credit/Debit Cards (Visa, Mastercard, RuPay), NetBanking, and Wallets.\n"
                    "• 🔒 **Enterprise-Grade Security:** Every order is secured with 256-bit SSL encryption, PCI-DSS compliance, and cryptographic signature verification.\n"
                    "• ⚡ **Instant Confirmation:** Once your payment is verified, your confirmed itinerary and ticket references are issued right away.\n"
                    "• 🛡️ **Demonstration Safe:** During this evaluation phase, transactions use secure sandbox verification so no actual money is debited from your personal accounts."
                ),
                "action_proposal": None,
                "suggested_followups": [
                    "Book a flight to Chennai",
                    "How does multimodal planning work?",
                    "View my bookings"
                ]
            }

        # 5. FAQs: Multimodal Travel
        if any(kw in text for kw in ["what is multimodal", "how does multimodal work", "explain multimodal", "what are multimodal journeys"]):
            return {
                "reply_text": (
                    "**Multimodal travel** connects different transportation types into one synchronized, door-to-door journey:\n\n"
                    "Rather than booking isolated tickets, TripPilot AI brings everything together:\n"
                    "1. **First-Mile Pickup:** A local auto or on-demand cab from your doorstep to the station or airport.\n"
                    "2. **Line-Haul Travel:** An express train or direct flight connecting cities efficiently.\n"
                    "3. **Last-Mile Drop-off:** A city metro ride or local cab straight to your final destination.\n\n"
                    "Our system automatically builds in sensible transfer buffers (e.g., 90 minutes for airport check-in, 30 minutes for railway stations) so you can make your connections comfortably without rushing."
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
                    "Here are the standard baggage guidelines across our supported transit operators:\n\n"
                    "• ✈️ **Domestic Flights (IndiGo, Air India, Akasa):** 7 kg cabin baggage + 15 kg check-in baggage included in standard Economy.\n"
                    "• 🚆 **Indian Railways & Vande Bharat:** Generous allowance up to 40 kg per passenger in AC Chair Car and Executive classes.\n"
                    "• 🚌 **Intercity Express Buses:** Up to 2 standard bags (approx. 20 kg total) in the secure lower luggage hold.\n"
                    "• 🚕 **Cabs & Autos:** 2–3 standard suitcases in sedan/SUV trunks; lightweight personal bags for autos."
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
            match = re.search(r"tp-[a-z0-9]{4,12}", text, re.IGNORECASE)
            ref_number = match.group(0).upper() if match else "TP-849201"
            if not user_id and not user_email:
                return {
                    "reply_text": f"Please sign in to your TripPilot AI account to cancel booking **{ref_number}**. This verifies account ownership before cancelling any travel reservations.",
                    "action_proposal": {
                        "action": "open_login",
                        "parameters": {},
                        "explanation": "Sign in to verify booking ownership and proceed with cancellation.",
                        "requires_user_confirmation": False
                    },
                    "suggested_followups": ["Log in to my account", "Keep my booking"]
                }
            return {
                "reply_text": f"I can help you cancel booking **{ref_number}**. Cancelling will release your reserved tickets. Please confirm below if you would like me to proceed with this cancellation.",
                "action_proposal": {
                    "action": "cancel_demo_booking",
                    "parameters": {"reference_number": ref_number},
                    "explanation": f"Request cancellation for booking {ref_number}. Requires your confirmation before executing.",
                    "requires_user_confirmation": True
                },
                "suggested_followups": ["Confirm cancellation", "Keep my booking", "View my active bookings"]
            }

        if "my booking" in text or "show bookings" in text or "upcoming trip" in text:
            if not user_id and not user_email:
                return {
                    "reply_text": "Please sign in to your TripPilot AI account to view and manage your travel bookings.",
                    "action_proposal": {
                        "action": "open_login",
                        "parameters": {},
                        "explanation": "Sign in to access your travel bookings.",
                        "requires_user_confirmation": False
                    },
                    "suggested_followups": ["Log in to my account", "Book a trip", "Search flights"]
                }
            bookings = await DatabaseRepository.get_bookings_by_user(user_id=user_id or "", email=user_email or "")
            active_count = len([b for b in bookings if b.get("status") == "CONFIRMED"])
            return {
                "reply_text": f"You currently have {active_count} confirmed booking{'s' if active_count != 1 else ''} in your account. You can view full ticket details and manage itineraries in your bookings dashboard.",
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
                    "I am **TripPilot AI**, your dedicated travel companion for India.\n\n"
                    "I specialize in searching schedules, comparing fares, composing door-to-door multimodal routes, and managing travel bookings across **Flights, Trains, Buses, Metro, Cabs, and Autos**.\n\n"
                    "While I can't assist with general non-travel topics, I would love to help you plan your next journey! Which destination are you headed to?"
                ),
                "action_proposal": None,
                "suggested_followups": [
                    "Find the cheapest train from Bengaluru to Chennai",
                    "Plan a multimodal trip with train and cab",
                    "Show direct flights under ₹5,000",
                    "What can you do?"
                ]
            }

        # 9. Extract Origin and Destination
        origin = None
        destination = None
        explicit_origin_found = False
        explicit_destination_found = False

        from_to_match = re.search(r"from\s+([a-zA-Z\s]+?)\s+to\s+([a-zA-Z\s]+?)(?:$|\s+tomorrow|\s+under|\s+before|\s+with|\s+in)", text)
        if from_to_match:
            origin = from_to_match.group(1).strip()
            destination = from_to_match.group(2).strip()
            explicit_origin_found = True
            explicit_destination_found = True
        else:
            to_from_match = re.search(r"to\s+([a-zA-Z\s]+?)\s+from\s+([a-zA-Z\s]+?)(?:$|\s+tomorrow|\s+under|\s+before|\s+with|\s+in)", text)
            if to_from_match:
                destination = to_from_match.group(1).strip()
                origin = to_from_match.group(2).strip()
                explicit_origin_found = True
                explicit_destination_found = True
            else:
                to_match = re.search(r"(?:to|towards)\s+([a-zA-Z\s]+?)(?:$|\s+tomorrow|\s+under|\s+before|\s+with|\s+in)", text)
                if to_match:
                    destination = to_match.group(1).strip()
                    explicit_destination_found = True
                from_match = re.search(r"(?:from|departing|leaving)\s+([a-zA-Z\s]+?)(?:$|\s+tomorrow|\s+under|\s+before|\s+with|\s+in)", text)
                if from_match:
                    origin = from_match.group(1).strip()
                    explicit_origin_found = True
        
        if not origin and current_search and current_search.get("origin"):
            origin = current_search["origin"]
        if not destination and current_search and current_search.get("destination"):
            destination = current_search["destination"]

        route_defaulted = False
        if not origin:
            origin = "Bengaluru"
            route_defaulted = True
        if not destination:
            destination = "Chennai"
            route_defaulted = True

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
                leg_summaries.append(f"{idx+1}. **{l['operator']}** ({l['mode'].title()}): {l['origin']['name']} ➔ {l['destination']['name']} ({dep_t}–{arr_t}, ₹{l['fare']:,})")

            if is_quick_booking_intent:
                reply = (
                    f"I've configured a {len(legs)}-leg connected multimodal journey from **{origin.title()}** to **{destination.title()}** for review and immediate booking:\n\n"
                    + "\n".join(leg_summaries)
                    + f"\n\n**Total Travel Time:** {dur_h}h {dur_m}m | **Total Fare Due:** ₹{total_amt:,} (Base fare ₹{comp_itinerary['total_fare']:,} + estimated taxes)\n\n"
                    + "Click **Book & Pay with Razorpay** below to open secure checkout, or customize passenger details first."
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
                        "explanation": f"Quick Book {len(legs)}-leg Multimodal Route ({modes_chain}, ₹{total_amt:,}) via Razorpay.",
                        "requires_user_confirmation": False
                    },
                    "suggested_followups": [
                        "Open Trip Planner to customize",
                        "Switch to direct flight",
                        "View my bookings"
                    ]
                }
            
            reply = (
                f"I've mapped out a connected {len(legs)}-leg door-to-door itinerary from **{origin.title()}** to **{destination.title()}** ({modes_chain}):\n\n"
                + "\n".join(leg_summaries)
                + f"\n\n**Total Travel Time:** {dur_h}h {dur_m}m | **Total Fare:** ₹{comp_itinerary['total_fare']:,} | **Connections:** {comp_itinerary['transfers_count']}\n\n"
                + "Each connection has been scheduled with adequate transfer buffers. You can fine-tune, add, or replace legs directly in the Multimodal Trip Planner."
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
                    f"Here is a recommended option matching your request, ready for review and booking:\n\n"
                    f"✈️ **{operator_name}** ({mode_label})\n"
                    f"📍 **{selected_journey['origin']['city']}** ({selected_journey['origin']['name']}) ➔ **{selected_journey['destination']['city']}** ({selected_journey['destination']['name']})\n"
                    f"⏱️ **Departure:** {dep_time_str} | **Arrival:** {arr_time_str} ({dur_h}h {dur_m}m)\n"
                    f"💳 **Total Amount Due:** ₹{total_amt:,} (Base fare ₹{base_fare:,} + estimated taxes)\n\n"
                    f"Click **Book & Pay via Razorpay** below to open secure checkout, or customize traveller details first."
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
                        "explanation": f"Quick Book {operator_name} ({selected_journey['origin']['city']} → {selected_journey['destination']['city']}, ₹{total_amt:,}) via Razorpay.",
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

        if match_count > 0:
            response_parts = [
                f"I found {match_count} travel option{'s' if match_count != 1 else ''} from **{origin.title()}** to **{destination.title()}**."
            ]
            if detected_modes:
                response_parts.append(f"Filtered to: {', '.join(m.title() for m in detected_modes)}.")
            if max_budget:
                response_parts.append(f"Budget capped under ₹{int(max_budget):,}.")
            if arrival_before:
                response_parts.append(f"Prioritizing arrival before {arrival_before}.")
            if sort_by != "recommended":
                sort_labels = {
                    "cheapest": "lowest fare first",
                    "fastest": "shortest duration first",
                    "earliest_arrival": "earliest arrival time"
                }
                response_parts.append(f"Sorted by {sort_labels.get(sort_by, sort_by.replace('_', ' '))}.")

            if route_defaulted and not explicit_origin_found and not explicit_destination_found:
                response_parts.append("\n\n*(Showing our popular Bengaluru ➔ Chennai route. You can specify any other cities, like 'Flights from Delhi to Mumbai'.)*")
            elif route_defaulted and explicit_destination_found and not explicit_origin_found:
                response_parts.append(f"\n\n*(Departing from {origin.title()}. If departing from a different city, let me know!)*")

            response_parts.append("\n\nI've updated the search results on your screen so you can inspect schedules and fares directly.")
            reply_text = " ".join(response_parts)
        else:
            reply_text = (
                f"I couldn't find any journeys matching your exact criteria from **{origin.title()}** to **{destination.title()}** with the active filters. "
                f"Try relaxing your budget cap or expanding transit modes to see available options."
            )

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
                "Arrive before 10:00 AM"
            ]
        }
