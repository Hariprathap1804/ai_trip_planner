# TripPilot AI — Input Validation Security Audit Report

**Date:** October 21, 2026  
**Auditor:** Senior Application Security Engineer  
**Scope:** Frontend and Backend Input Validation, Data Types, Boundary Checks, Payload Limits, AI Prompt Guards, Payment Integrity, and Booking Schemas  
**Target Document:** `docs/INPUT_VALIDATION_AUDIT.md`  
**Status:** Audit Completed — Awaiting Approval Before Implementing Fixes

---

## 1. Executive Summary

A comprehensive application security audit of the **TripPilot AI** codebase was performed to evaluate input handling across the React frontend and FastAPI backend.

The audit identified significant input validation gaps across the booking lifecycle, payment calculation pipeline, search filters, authentication endpoints, and AI travel assistant:
1. **Critical Price & Journey Tampering:** The server accepts client-supplied journey objects with arbitrary fares (e.g. ₹1.00) during booking and payment verification rather than resolving canonical journey data server-side by ID.
2. **Missing Passenger & Contact Validation:** The backend allows bookings with 0 passengers, negative passenger ages (`age = -50`), invalid email addresses, and unvalidated phone strings.
3. **Untyped Multimodal Planning Endpoint:** `POST /api/multimodal/plan` accepts raw `Dict[str, Any]` without Pydantic schema validation, permitting negative fares and corrupted leg structures.
4. **Unbounded AI Prompts:** `POST /api/ai/chat` permits arbitrarily large text payloads without length constraints, creating token exhaustion and Denial-of-Service (DoS) risks against external LLM providers.
5. **Inconsistent Search & Filter Controls:** Query parameters accept negative budgets, inverted budget ranges, and dates centuries in the past.

---

## 2. Vulnerability Severity Matrix

| Finding ID | Severity | Category | Vulnerability Summary | Status |
| :---: | :---: | :--- | :--- | :---: |
| **VAL-01** | 🔴 **Critical** | Business Logic / Tampering | Client-supplied journey fare tampering allows booking trips for ₹1.00 | ✅ **RESOLVED** (Canonical server lookup enforced) |
| **VAL-02** | 🟠 **High** | Data Integrity & Types | Passenger model allows 0 passengers, negative ages, and invalid contact data | ✅ **RESOLVED** (Pydantic bounds & regex validators added) |
| **VAL-03** | 🟠 **High** | Missing Schema Validation | `POST /api/multimodal/plan` accepts raw untyped dictionaries with negative fares | ✅ **RESOLVED** (Typed `List[JourneyLeg]` & positive fare check) |
| **VAL-04** | 🟠 **High** | Resource Exhaustion (DoS) | `AIRequest.prompt` has no length restriction, exposing Groq API to token exhaustion | ⏳ **PENDING (Phase 2)** |
| **VAL-05** | 🟡 **Medium** | Range & Logic Inconsistency | Search filters accept negative budgets, inverted ranges, and arbitrary sort strings | ⏳ **PENDING (Phase 2)** |
| **VAL-06** | 🟡 **Medium** | Missing Constraints | Authentication models omit phone validation and password maximum length constraints | ⏳ **PENDING (Phase 2)** |
| **VAL-07** | 🟡 **Medium** | Information Disclosure | AI conversational handler queries global database bookings instead of user-scoped records | ⏳ **PENDING (Phase 2)** |
| **VAL-08** | 🟡 **Medium** | Identifier Validation | Booking update and retrieval endpoints accept unvalidated string identifiers | ⏳ **PENDING (Phase 3)** |
| **VAL-09** | 🟢 **Low** | Client-Side Gaps | Frontend datepicker permits past dates and form lacks pre-submission regex validation | ⏳ **PENDING (Phase 3)** |
| **VAL-10** | 🟢 **Low** | Architecture Observation | File uploads not supported; zero path traversal risk in current surface | ✅ **VERIFIED (N/A)** |

---

## 3. Detailed Vulnerability Analyses

---

### 🔴 Critical Severity

#### VAL-01: Client-Side Price & Journey Fare Tampering in Booking and Payment Workflows
- **Vulnerable Files:**
  - [`backend/app/routers/bookings.py:L48-60`](file:///e:/Vibe_Code_Projects/AI%20Powered%20Travel%20Site/backend/app/routers/bookings.py#L48-L60)
  - [`backend/app/routers/payments.py:L69-74`](file:///e:/Vibe_Code_Projects/AI%20Powered%20Travel%20Site/backend/app/routers/payments.py#L69-L74)
  - [`backend/app/services/booking_service.py:L36-38`](file:///e:/Vibe_Code_Projects/AI%20Powered%20Travel%20Site/backend/app/services/booking_service.py#L36-L38)
  - [`backend/app/services/payment_service.py:L165-179`](file:///e:/Vibe_Code_Projects/AI%20Powered%20Travel%20Site/backend/app/services/payment_service.py#L165-L179)
- **Vulnerable Code Pattern:**
  In `backend/app/routers/bookings.py`:
  ```python
  @router.post("")
  async def create_booking(payload: BookingCreate, current_user: Dict[str, Any] = Depends(get_current_user_required)):
      payload.user_id = current_user["id"]
      journey_data = payload.journey.dict() if payload.journey else None
      if not journey_data and payload.journey_id:
          journey_data = await JourneyService.get_journey_by_id(payload.journey_id)
      return await BookingService.create_booking(payload, journey_data)
  ```
  And in `backend/app/services/payment_service.py`:
  ```python
  base_fare = float(journey_data.get("total_fare", 0))
  taxes = round(base_fare * 0.12, 2)
  total_fare_due = round(base_fare + taxes, 2)
  # Server checks if order amount matches total_fare_due, BUT total_fare_due was derived from journey_data provided by the client!
  ```
- **Technical Flaw (CWE-472 / CWE-20):**
  The application trusts client-supplied journey data (`payload.journey` or `payload.journey_data`). If a client passes an inlined `journey` object, the backend never fetches the true journey from `DatabaseRepository` to verify `total_fare`.
- **Live Exploit Verification:**
  A test request was dispatched with a forged journey object having `total_fare: 1.00` targeting a business class flight:
  ```json
  POST /api/bookings
  {
    "journey": {
      "id": "forged_luxury_flight_999",
      "total_fare": 1.00,
      "modes": ["flight"], ...
    },
    "passengers": [...]
  }
  ```
  **Server Output:**
  ```text
  [Price Tampering] Booking confirmed with forged price:
    Total Amount Charged: 1.12 INR (Base fare: 1.0 INR)
  ```
- **Realistic Attack Scenario:**
  1. An attacker browses a luxury flight or first-class train ticket costing ₹8,500.
  2. Instead of completing checkout normally, the attacker intercepts the API request or scripts a direct `POST /api/bookings` or `POST /api/payments/verify-and-book`.
  3. The attacker sets `journey.total_fare = 1.00`.
  4. The backend confirms the booking, issues a valid PNR reference, and marks the ticket as `CONFIRMED` in the database for ₹1.12.
- **Recommended Remediation:**
  1. Deprecate client-supplied `journey` objects in `BookingCreate` and `PaymentVerifyAndBook`. Make `journey_id: str` mandatory.
  2. Always resolve canonical journey pricing server-side:
     ```python
     canonical_journey = await JourneyService.get_journey_by_id(payload.journey_id)
     if not canonical_journey:
         raise HTTPException(status_code=400, detail="Invalid journey ID.")
     base_fare = canonical_journey["total_fare"] * len(payload.passengers)
     ```
  3. For multimodal custom journeys composed via `/api/multimodal/plan`, generate a signed HMAC journey token or store the temporary composed itinerary in Redis/database with server-calculated fares.

---

### 🟠 High Severity

#### VAL-02: Missing Passenger & Contact Input Validation in Booking Models
- **Vulnerable File:** [`backend/app/models/schemas.py:L94-102, L127-135`](file:///e:/Vibe_Code_Projects/AI%20Powered%20Travel%20Site/backend/app/models/schemas.py#L94-L102)
- **Vulnerable Code:**
  ```python
  class Passenger(BaseModel):
      id: Optional[str] = None
      full_name: str
      age: int
      gender: Literal['male', 'female', 'other']
      seat_preference: Optional[str] = None
      email: str
      phone: str

  class BookingCreate(BaseModel):
      journey_id: Optional[str] = None
      journey: Optional[Journey] = None
      passengers: List[Passenger]
      contact_email: str
      contact_phone: str
      notes: Optional[str] = None
      user_id: Optional[str] = None
  ```
- **Technical Flaw (CWE-20 / CWE-1287):**
  1. `full_name`: No length constraints (`min_length=1`, `max_length=100`). Empty string `""` is permitted.
  2. `age`: No numeric range validation (`ge=1`, `le=120`). Accepts negative integers (`-50`) or absurd values (`9999`).
  3. `email` (in `Passenger`) and `contact_email` (in `BookingCreate` and `BookingUpdate`): Defined as raw `str` with zero email regex/format checks.
  4. `phone` and `contact_phone`: Defined as raw `str` with no format or character validation.
  5. `passengers`: Defined as `List[Passenger]` with no `min_items=1`. Accepts `passengers: []` (0 passengers).
  6. `notes`: Unrestricted string length allowing multi-megabyte payloads.
- **Live Exploit Verification:**
  ```text
  [Booking: Zero Passengers & Invalid Contact] Status: 200
    Result: Created booking reference TP-668BCSFE with 0 passengers!
  [Booking: Negative Age & Invalid Email] Status: 200
    Result: Created booking with passenger age=-50, name='', email='definitely_not_an_email'!
  ```
- **Recommended Remediation:**
  Update Pydantic models with strict field validation:
  ```python
  class Passenger(BaseModel):
      full_name: str = Field(..., min_length=2, max_length=100)
      age: int = Field(..., ge=1, le=120)
      gender: Literal['male', 'female', 'other']
      seat_preference: Optional[str] = Field(None, max_length=50)
      email: str = Field(..., min_length=5, max_length=150)
      phone: str = Field(..., min_length=7, max_length=20)

      @validator("email")
      def validate_email(cls, v):
          clean = v.strip().lower()
          if not re.match(r"^[^@\s]+@[^@\s]+\.[^@\s]+$", clean):
              raise ValueError("Invalid email format")
          return clean

      @validator("phone")
      def validate_phone(cls, v):
          clean = re.sub(r"[\s\-\(\)]", "", v)
          if not re.match(r"^\+?[0-9]{7,15}$", clean):
              raise ValueError("Invalid phone number format")
          return v

  class BookingCreate(BaseModel):
      journey_id: str = Field(..., min_length=3, max_length=64)
      passengers: List[Passenger] = Field(..., min_items=1, max_items=9)
      contact_email: str = Field(..., min_length=5, max_length=150)
      contact_phone: str = Field(..., min_length=7, max_length=20)
      notes: Optional[str] = Field(None, max_length=500)
  ```

---

#### VAL-03: Zero Schema Validation in Multimodal Planning Endpoint
- **Vulnerable File:** [`backend/app/routers/multimodal.py:L8-12`](file:///e:/Vibe_Code_Projects/AI%20Powered%20Travel%20Site/backend/app/routers/multimodal.py#L8-L12)
- **Vulnerable Code:**
  ```python
  @router.post("/plan")
  async def plan_multimodal(legs: List[Dict[str, Any]] = Body(...)) -> Dict[str, Any]:
      try:
          return MultimodalService.compose_multimodal_journey(legs)
      except Exception as e:
          raise HTTPException(status_code=400, detail=str(e))
  ```
- **Technical Flaw (CWE-20 / CWE-704):**
  The endpoint uses `List[Dict[str, Any]]`, bypassing FastAPI's Pydantic validation pipeline completely.
  Callers can pass arbitrary dictionary objects, negative fares, non-existent transit modes, or huge arrays (e.g. 10,000 legs), resulting in server CPU spikes or corrupted journey calculations.
- **Live Exploit Verification:**
  `POST /api/multimodal/plan` with `[{"fare": -500, "mode": "flight", ...}]` returned HTTP 200 with negative total journey fare.
- **Recommended Remediation:**
  Bind the request payload to a typed Pydantic schema using the existing `JourneyLeg` model with array boundaries:
  ```python
  @router.post("/plan", response_model=Journey)
  async def plan_multimodal(legs: List[JourneyLeg] = Body(..., min_items=1, max_items=8)) -> Dict[str, Any]:
      return MultimodalService.compose_multimodal_journey([leg.dict() for leg in legs])
  ```

---

#### VAL-04: Unbounded AI Assistant Prompts & Context Injection
- **Vulnerable Files:**
  - [`backend/app/models/schemas.py:L203-209`](file:///e:/Vibe_Code_Projects/AI%20Powered%20Travel%20Site/backend/app/models/schemas.py#L203-L209)
  - [`backend/app/routers/ai.py:L8-14`](file:///e:/Vibe_Code_Projects/AI%20Powered%20Travel%20Site/backend/app/routers/ai.py#L8-L14)
- **Vulnerable Code:**
  ```python
  class AIRequest(BaseModel):
      prompt: str
      current_search: Optional[Dict[str, Any]] = None
      active_filters: Optional[Dict[str, Any]] = None
      selected_journey_id: Optional[str] = None
      conversation_history: Optional[List[Dict[str, Any]]] = None
  ```
- **Technical Flaw (CWE-400 / CWE-776):**
  1. `prompt: str` has no `max_length`. A user can transmit 5MB–10MB strings.
  2. Because this endpoint is publicly accessible without authentication, malicious actors can flood `/api/ai/chat` with massive payloads. This consumes bandwidth, burns Groq API token quotas, and exhausts API rate limits.
  3. `current_search` and `active_filters` are raw untyped dictionaries interpolated directly into the LLM system prompt context without sanitization.
- **Recommended Remediation:**
  Add strict boundaries to `AIRequest`:
  ```python
  class AIRequest(BaseModel):
      prompt: str = Field(..., min_length=1, max_length=1000)
      current_search: Optional[Dict[str, Any]] = None
      active_filters: Optional[Dict[str, Any]] = None
  ```
  Add rate limiting to `/api/ai/chat` (e.g. 20 requests per minute per IP).

---

### 🟡 Medium Severity

#### VAL-05: Unvalidated Search Parameters, Negative Limits, and Inconsistent Date Ranges
- **Vulnerable Files:**
  - [`backend/app/routers/journeys.py:L8-20`](file:///e:/Vibe_Code_Projects/AI%20Powered%20Travel%20Site/backend/app/routers/journeys.py#L8-L20)
  - [`backend/app/services/journey_service.py:L57-65`](file:///e:/Vibe_Code_Projects/AI%20Powered%20Travel%20Site/backend/app/services/journey_service.py#L57-L65)
  - [`backend/app/models/schemas.py:L84-93`](file:///e:/Vibe_Code_Projects/AI%20Powered%20Travel%20Site/backend/app/models/schemas.py#L84-L93)
- **Technical Flaw (CWE-20):**
  1. `min_budget` and `max_budget`: Accepts negative numbers (`-500`). Does not validate that `min_budget <= max_budget`.
  2. `date`: Parameter is accepted but never validated or parsed. Allows past dates (`1800-01-01`) or arbitrary string values.
  3. `sort_by`: Declared as `Optional[str]` instead of `Optional[SortOption]`. Any arbitrary string is accepted by the router.
  4. `modes`: Accepts arbitrary `List[str]` instead of `List[TransportMode]`.
  5. `origin` and `destination`: No length limits; does not check if `origin.strip().lower() == destination.strip().lower()`.
- **Live Exploit Verification:**
  `GET /api/journeys/search?min_budget=-500&max_budget=-100&date=1800-01-01&sort_by=arbitrary_exploit` returned HTTP 200 OK.
- **Recommended Remediation:**
  Use FastAPI Query constraints:
  ```python
  @router.get("/search")
  async def search_journeys(
      origin: str = Query("Bengaluru", min_length=2, max_length=50),
      destination: str = Query("Chennai", min_length=2, max_length=50),
      date: Optional[str] = Query(None, regex=r"^\d{4}-\d{2}-\d{2}$"),
      modes: Optional[List[TransportMode]] = Query(None),
      min_budget: Optional[float] = Query(None, ge=0, le=100000),
      max_budget: Optional[float] = Query(None, ge=0, le=100000),
      max_duration: Optional[int] = Query(None, ge=15, le=2880),
      sort_by: Optional[SortOption] = Query("recommended")
  ):
      if min_budget is not None and max_budget is not None and min_budget > max_budget:
          raise HTTPException(status_code=400, detail="min_budget cannot exceed max_budget")
      ...
  ```

---

#### VAL-06: Missing Phone & Field Validation in User Authentication Models
- **Vulnerable Files:**
  - [`backend/app/models/schemas.py:L137-165`](file:///e:/Vibe_Code_Projects/AI%20Powered%20Travel%20Site/backend/app/models/schemas.py#L137-L165)
- **Technical Flaw (CWE-20):**
  1. `UserRegister.phone`: Defined as `Optional[str] = None` with no format check, no length cap, and no digit validation.
  2. `UserLogin.password`: Defined as `str` without `max_length`. Large payloads force unnecessary memory allocation and hashing overhead.
  3. `UserRegister.name`: Has `min_length=2, max_length=100`, but lacks whitespace trimming and character hygiene validation.
- **Recommended Remediation:**
  Add validators and `max_length=100` to `UserLogin.password` and regex validation for `phone`.

---

#### VAL-07: AI Agent Database Context Leakage
- **Vulnerable File:** [`backend/app/services/ai_service.py:L367-379`](file:///e:/Vibe_Code_Projects/AI%20Powered%20Travel%20Site/backend/app/services/ai_service.py#L367-L379)
- **Vulnerable Code:**
  ```python
  if "my booking" in text or "show bookings" in text or "upcoming trip" in text:
      bookings = await DatabaseRepository.get_bookings()
      active_count = len([b for b in bookings if b.get("status") == "CONFIRMED"])
      return {
          "reply_text": f"You currently have {active_count} active simulated bookings in your account.",
          ...
      }
  ```
- **Technical Flaw (CWE-200 / CWE-284):**
  When a user asks the AI "show my bookings", the service calls `DatabaseRepository.get_bookings()`, which queries **all bookings across all users in the system**.
  The AI then reports the aggregate count of all confirmed system bookings to the user, leaking operational data across user boundaries.
- **Recommended Remediation:**
  Pass authenticated user context (`user_id`, `email`) into `AIService.process_user_prompt`. If unauthenticated, prompt the user to sign in; if authenticated, query only `DatabaseRepository.get_bookings_by_user(user_id, email)`.

---

#### VAL-08: Identifier Validation in Booking Lifecycle Endpoints
- **Vulnerable Files:**
  - [`backend/app/routers/bookings.py:L36, L62, L77`](file:///e:/Vibe_Code_Projects/AI%20Powered%20Travel%20Site/backend/app/routers/bookings.py#L36)
- **Technical Flaw (CWE-20):**
  Endpoints `GET /api/bookings/{booking_id}`, `POST /api/bookings/{booking_id}/cancel`, and `PATCH /api/bookings/{booking_id}` accept raw `str`.
  Although `update_booking_status` checks the regex `^[a-zA-Z0-9_\-]{3,64}$`, the router path parameter itself does not enforce this constraint, allowing malformed strings or URL injection patterns into service layers.
- **Recommended Remediation:**
  Use FastAPI path parameter validation:
  ```python
  booking_id: str = Path(..., regex=r"^[a-zA-Z0-9_\-]{3,64}$")
  ```

---

### 🟢 Low Severity

#### VAL-09: Client-Side Form Validation Gaps & Unrestricted Datepicker
- **Vulnerable Files:**
  - [`frontend/src/components/search/UnifiedSearchWidget.tsx:L107-114`](file:///e:/Vibe_Code_Projects/AI%20Powered%20Travel%20Site/frontend/src/components/search/UnifiedSearchWidget.tsx#L107-L114)
  - [`frontend/src/pages/BookingReviewPage.tsx:L210-230`](file:///e:/Vibe_Code_Projects/AI%20Powered%20Travel%20Site/frontend/src/pages/BookingReviewPage.tsx#L210-L230)
- **Technical Flaw (CWE-602):**
  1. `<input type="date">` in `UnifiedSearchWidget.tsx` lacks a `min` attribute, allowing users to pick past dates in the UI.
  2. `BookingReviewPage.tsx` does not validate email and phone format prior to dispatching payment or booking orders.
- **Recommended Remediation:**
  Add `min={new Date().toISOString().split('T')[0]}` to date inputs and validate regex before submitting booking forms.

---

#### VAL-10: File Upload Architecture Status
- **Inspection Finding:**
  The TripPilot AI codebase was audited for file handling, uploads (`UploadFile`, `File`), and path traversal risks.
- **Result:**
  No file upload endpoints, profile picture uploads, or dynamic file reading operations exist in the current application. Zero path traversal vulnerability exists. If file upload features are added in the future, safe filename hashing and MIME-type validation must be enforced.

---

## 4. Remediation Roadmap & Implementation Progress

- [x] **Phase 1 (Critical & High — Data Integrity & Fares) [COMPLETED & VERIFIED]:**
  - ✅ Make `journey_id` mandatory in `BookingCreate` and `PaymentVerifyAndBook`; resolve fares and itineraries strictly server-side from canonical database records.
  - ✅ Implement Pydantic field validators and regex checks on `Passenger` and `BookingCreate` (full name min 2 chars, age 1–120, email format regex, phone digits 7–15, passenger count 1–9).
  - ✅ Convert `POST /api/multimodal/plan` to accept typed `List[JourneyLeg]`, reject negative fares, and register composed journeys in memory cache for canonical lookup.
- [ ] **Phase 2 (Medium — Search, Auth & AI Guards) [NEXT]:**
  - Add query constraints to `GET /api/journeys/search` (positive budget ranges, `SortOption` enum, date format).
  - Add length limits to `AIRequest.prompt` (max 1,000 characters) and rate limit `/api/ai/chat`.
  - Pass user identity to `AIService` to prevent multi-tenant booking leakage.
  - Enforce phone and character validation on user authentication schemas.
- [ ] **Phase 3 (Frontend Polish & Path Boundaries):**
  - Add `min` date constraint to `UnifiedSearchWidget.tsx`.
  - Add client-side regex feedback on `BookingReviewPage.tsx`.
  - Enforce regex path constraints on all `booking_id` route parameters.
