from pydantic import BaseModel, Field
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
    duration_minutes: int
    fare: float
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
    full_name: str
    age: int
    gender: Literal['male', 'female', 'other']
    seat_preference: Optional[str] = None
    email: str
    phone: str

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

class BookingCreate(BaseModel):
    journey_id: Optional[str] = None
    journey: Optional[Journey] = None
    passengers: List[Passenger]
    contact_email: str
    contact_phone: str
    notes: Optional[str] = None

class BookingUpdate(BaseModel):
    contact_email: Optional[str] = None
    contact_phone: Optional[str] = None
    notes: Optional[str] = None

class PaymentOrderCreate(BaseModel):
    amount: float
    currency: str = "INR"
    receipt: Optional[str] = None
    notes: Optional[Dict[str, Any]] = None

class PaymentVerifyAndBook(BaseModel):
    order_id: str
    payment_id: str
    signature: str
    booking_payload: BookingCreate
    journey_data: Optional[Dict[str, Any]] = None

class AIActionProposal(BaseModel):
    action: str # search_journeys, apply_filters, clear_filters, sort_results, compare_journeys, plan_multimodal_trip, quick_book, cancel_demo_booking
    parameters: Dict[str, Any]
    explanation: str
    requires_user_confirmation: bool = False

class AIRequest(BaseModel):
    prompt: str
    current_search: Optional[Dict[str, Any]] = None
    active_filters: Optional[Dict[str, Any]] = None
    selected_journey_id: Optional[str] = None
    conversation_history: Optional[List[Dict[str, Any]]] = None

class AIResponse(BaseModel):
    reply_text: str
    action_proposal: Optional[AIActionProposal] = None
    suggested_followups: Optional[List[str]] = []
