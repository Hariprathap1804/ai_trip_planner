import re
from pydantic import BaseModel, Field, validator
from typing import List, Optional, Dict, Any, Literal

TransportMode = Literal['flight', 'train', 'metro', 'bus', 'auto', 'cab', 'multimodal']
BookingStatus = Literal['CONFIRMED', 'CANCELLED', 'COMPLETED']
SortOption = Literal['recommended', 'cheapest', 'fastest', 'earliest_arrival']

class Coordinates(BaseModel):
    lat: float
    lng: float

class LocationHub(BaseModel):
    id: str
    name: str
    city: str
    code: Optional[str] = None
    type: Literal['airport', 'railway_station', 'metro_station', 'bus_terminal', 'landmark', 'address']
    coordinates: Optional[Coordinates] = None

class Amenity(BaseModel):
    id: str
    label: str
    icon_name: str

class JourneyLeg(BaseModel):
    id: str
    mode: TransportMode
    operator: str
    service_number: Optional[str] = None
    origin: LocationHub
    destination: LocationHub
    departure_time: str
    arrival_time: str
    duration_minutes: int = Field(..., ge=1, le=2880)
    fare: float = Field(..., ge=0, le=500000)
    class_or_category: str
    stops_count: int = 0
    stop_details: Optional[List[str]] = []
    amenities: Optional[List[Amenity]] = []
    baggage_allowance: Optional[str] = None
    seat_status: str = "Available"
    seat_count: Optional[int] = None

class Journey(BaseModel):
    id: str
    is_multimodal: bool = False
    modes: List[TransportMode]
    origin: LocationHub
    destination: LocationHub
    departure_time: str
    arrival_time: str
    total_duration_minutes: int
    total_fare: float
    legs: List[JourneyLeg]
    transfers_count: int = 0
    transfer_buffer_minutes: int = 0
    recommended_score: float = 85.0
    ai_recommendation_reason: Optional[str] = None

class SearchFilters(BaseModel):
    min_budget: Optional[float] = None
    max_budget: Optional[float] = None
    max_duration_minutes: Optional[int] = None
    time_of_day: Optional[List[str]] = None # early_morning, morning, afternoon, evening, night
    max_transfers: Optional[int] = None
    comfort_preference: Optional[str] = None
    
    # Mode specific
    flight_airlines: Optional[List[str]] = None
    flight_direct_only: Optional[bool] = None
    flight_cabin_class: Optional[List[str]] = None
    
    train_classes: Optional[List[str]] = None
    train_types: Optional[List[str]] = None
    
    bus_operators: Optional[List[str]] = None
    bus_ac_only: Optional[bool] = None
    bus_sleeper_only: Optional[bool] = None
    
    metro_max_interchanges: Optional[int] = None
    cab_categories: Optional[List[str]] = None

class SearchQuery(BaseModel):
    origin: str
    destination: str
    date: str
    return_date: Optional[str] = None
    passengers: int = 1
    modes: Optional[List[TransportMode]] = None
    filters: Optional[SearchFilters] = None
    sort_by: Optional[SortOption] = 'recommended'

class Passenger(BaseModel):
    id: Optional[str] = None
    full_name: str = Field(..., min_length=2, max_length=100)
    age: int = Field(..., ge=1, le=120)
    gender: Literal['male', 'female', 'other']
    seat_preference: Optional[str] = Field(None, max_length=50)
    email: str = Field(..., min_length=5, max_length=150)
    phone: str = Field(..., min_length=7, max_length=25)

    @validator("full_name")
    def validate_full_name(cls, v):
        clean = v.strip()
        if len(clean) < 2:
            raise ValueError("Passenger full name must be at least 2 characters.")
        if re.search(r"[<>{}\[\];]", clean):
            raise ValueError("Passenger full name contains invalid characters.")
        return clean

    @validator("email")
    def validate_email(cls, v):
        clean = v.strip().lower()
        if not re.match(r"^[^@\s]+@[^@\s]+\.[^@\s]+$", clean):
            raise ValueError("Please provide a valid passenger email address.")
        return clean

    @validator("phone")
    def validate_phone(cls, v):
        clean = v.strip()
        digits = re.sub(r"[\s\-\(\)\+]", "", clean)
        if not digits.isdigit() or len(digits) < 7 or len(digits) > 15:
            raise ValueError("Please provide a valid phone number (7 to 15 digits).")
        return clean

class FareBreakdown(BaseModel):
    base_fare: float
    taxes_and_fees: float
    discounts: float = 0.0
    total_amount: float

class DemoBooking(BaseModel):
    id: str
    reference_number: str # e.g. TP-849201
    created_at: str
    status: BookingStatus = "CONFIRMED"
    journey: Journey
    passengers: List[Passenger]
    fare_breakdown: FareBreakdown
    contact_email: str
    contact_phone: str
    notes: Optional[str] = None
    is_simulated_demo: bool = True
    payment_status: Optional[str] = "PAID"
    razorpay_order_id: Optional[str] = None
    razorpay_payment_id: Optional[str] = None
    payment_method: Optional[str] = "simulated"
    user_id: Optional[str] = None

class BookingCreate(BaseModel):
    journey_id: str = Field(..., min_length=3, max_length=64)
    journey: Optional[Journey] = None # Deprecated; canonical server lookup enforced
    passengers: List[Passenger] = Field(..., min_items=1, max_items=9)
    contact_email: str = Field(..., min_length=5, max_length=150)
    contact_phone: str = Field(..., min_length=7, max_length=25)
    notes: Optional[str] = Field(None, max_length=500)
    user_id: Optional[str] = None

    @validator("contact_email")
    def validate_contact_email(cls, v):
        clean = v.strip().lower()
        if not re.match(r"^[^@\s]+@[^@\s]+\.[^@\s]+$", clean):
            raise ValueError("Please provide a valid contact email address.")
        return clean

    @validator("contact_phone")
    def validate_contact_phone(cls, v):
        clean = v.strip()
        digits = re.sub(r"[\s\-\(\)\+]", "", clean)
        if not digits.isdigit() or len(digits) < 7 or len(digits) > 15:
            raise ValueError("Please provide a valid contact phone number (7 to 15 digits).")
        return clean

# User Authentication Schemas
class UserRegister(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    email: str = Field(..., min_length=5, max_length=150)
    password: str = Field(..., min_length=8, max_length=100)
    phone: Optional[str] = Field(None, max_length=25)

    @validator("name")
    def validate_name(cls, v):
        clean = v.strip()
        if len(clean) < 2:
            raise ValueError("Name must be at least 2 characters.")
        if re.search(r"[<>{}\[\];]", clean):
            raise ValueError("Name contains invalid characters.")
        return clean

    @validator("email")
    def validate_email_format(cls, v):
        clean = v.strip().lower()
        if not re.match(r"^[^@\s]+@[^@\s]+\.[^@\s]+$", clean):
            raise ValueError("Please provide a valid email address.")
        return clean

    @validator("phone")
    def validate_phone(cls, v):
        if v is None:
            return None
        clean = v.strip()
        if not clean:
            return None
        digits = re.sub(r"[\s\-\(\)\+]", "", clean)
        if not digits.isdigit() or len(digits) < 7 or len(digits) > 15:
            raise ValueError("Please provide a valid phone number (7 to 15 digits).")
        return clean

    @validator("password")
    def validate_password_complexity(cls, v):
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters long.")
        if not re.search(r"[a-zA-Z]", v):
            raise ValueError("Password must contain at least one letter.")
        if not re.search(r"[0-9]", v):
            raise ValueError("Password must contain at least one number.")
        if len(set(v)) < 4:
            raise ValueError("Password cannot consist of repeated characters. Please choose a stronger password.")
        return v

class UserLogin(BaseModel):
    email: str = Field(..., min_length=5, max_length=150)
    password: str = Field(..., min_length=1, max_length=100)

    @validator("email")
    def validate_login_email(cls, v):
        clean = v.strip().lower()
        if not re.match(r"^[^@\s]+@[^@\s]+\.[^@\s]+$", clean):
            raise ValueError("Please provide a valid email address.")
        return clean

class UserResponse(BaseModel):
    id: str
    name: str
    email: str
    phone: Optional[str] = None
    avatar_url: Optional[str] = None
    created_at: Optional[str] = None

class AuthResponse(BaseModel):
    user: UserResponse
    token: str
    message: Optional[str] = "Authentication successful"

class BookingUpdate(BaseModel):
    contact_email: Optional[str] = Field(None, min_length=5, max_length=150)
    contact_phone: Optional[str] = Field(None, min_length=7, max_length=25)
    notes: Optional[str] = Field(None, max_length=500)

    @validator("contact_email")
    def validate_update_email(cls, v):
        if v is None:
            return None
        clean = v.strip().lower()
        if not re.match(r"^[^@\s]+@[^@\s]+\.[^@\s]+$", clean):
            raise ValueError("Please provide a valid contact email address.")
        return clean

    @validator("contact_phone")
    def validate_update_phone(cls, v):
        if v is None:
            return None
        clean = v.strip()
        digits = re.sub(r"[\s\-\(\)\+]", "", clean)
        if not digits.isdigit() or len(digits) < 7 or len(digits) > 15:
            raise ValueError("Please provide a valid contact phone number (7 to 15 digits).")
        return clean

class PaymentOrderCreate(BaseModel):
    amount: float = Field(..., gt=0, le=500000)
    currency: Literal["INR"] = "INR"
    receipt: Optional[str] = Field(None, max_length=64)
    notes: Optional[Dict[str, Any]] = None

class PaymentVerifyAndBook(BaseModel):
    order_id: str = Field(..., min_length=6, max_length=64)
    payment_id: str = Field(..., min_length=6, max_length=64)
    signature: str = Field(..., min_length=10, max_length=128)
    booking_payload: BookingCreate
    journey_data: Optional[Dict[str, Any]] = None # Deprecated; canonical server lookup enforced

class AIActionProposal(BaseModel):
    action: str # search_journeys, apply_filters, clear_filters, sort_results, compare_journeys, plan_multimodal_trip, quick_book, cancel_demo_booking
    parameters: Dict[str, Any]
    explanation: str
    requires_user_confirmation: bool = False

class AIRequest(BaseModel):
    prompt: str = Field(..., min_length=1, max_length=1000)
    current_search: Optional[Dict[str, Any]] = None
    active_filters: Optional[Dict[str, Any]] = None
    selected_journey_id: Optional[str] = Field(None, max_length=64)
    conversation_history: Optional[List[Dict[str, Any]]] = None

    @validator("prompt")
    def validate_prompt(cls, v):
        clean = v.strip()
        if not clean:
            raise ValueError("Prompt cannot be empty or purely whitespace.")
        if len(clean) > 1000:
            raise ValueError("Prompt exceeds maximum length of 1000 characters.")
        return clean

class AIResponse(BaseModel):
    reply_text: str
    action_proposal: Optional[AIActionProposal] = None
    suggested_followups: Optional[List[str]] = []
