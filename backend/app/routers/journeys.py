from fastapi import APIRouter, Query, Path, HTTPException
from typing import List, Optional, Dict, Any
from datetime import datetime
from app.services.journey_service import JourneyService
from app.models.schemas import SearchFilters, TransportMode, SortOption

router = APIRouter(prefix="/api/journeys", tags=["Journeys"])

@router.get("/search")
async def search_journeys(
    origin: str = Query("Bengaluru", min_length=2, max_length=50, description="Origin city or transit hub"),
    destination: str = Query("Chennai", min_length=2, max_length=50, description="Destination city or transit hub"),
    date: Optional[str] = Query(None, pattern=r"^\d{4}-\d{2}-\d{2}$", description="Travel date YYYY-MM-DD"),
    modes: Optional[List[TransportMode]] = Query(None, description="Filter by transportation modes"),
    min_budget: Optional[float] = Query(None, ge=0, le=100000, description="Minimum fare in INR"),
    max_budget: Optional[float] = Query(None, ge=0, le=100000, description="Maximum fare in INR"),
    max_duration: Optional[int] = Query(None, ge=15, le=2880, description="Maximum duration in minutes"),
    time_of_day: Optional[List[str]] = Query(None, description="Filter by departure time slots e.g. early_morning, morning, afternoon, evening"),
    flight_direct_only: Optional[bool] = Query(None),
    bus_ac_only: Optional[bool] = Query(None),
    sort_by: Optional[SortOption] = Query("recommended", description="Sorting option")
) -> List[Dict[str, Any]]:
    if min_budget is not None and max_budget is not None and min_budget > max_budget:
        raise HTTPException(status_code=400, detail="min_budget cannot exceed max_budget")

    if date:
        try:
            datetime.strptime(date, "%Y-%m-%d")
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid date format. Expected YYYY-MM-DD.")

    filters = SearchFilters(
        min_budget=min_budget,
        max_budget=max_budget,
        max_duration_minutes=max_duration,
        time_of_day=time_of_day,
        flight_direct_only=flight_direct_only,
        bus_ac_only=bus_ac_only
    )
    return await JourneyService.search_journeys(
        origin=origin,
        destination=destination,
        date=date,
        modes=modes,
        filters=filters,
        sort_by=sort_by
    )

@router.get("/{journey_id}")
async def get_journey(
    journey_id: str = Path(..., pattern=r"^[a-zA-Z0-9_\-]{3,64}$", description="Canonical alphanumeric journey ID")
) -> Dict[str, Any]:
    journey = await JourneyService.get_journey_by_id(journey_id)
    if not journey:
        raise HTTPException(status_code=404, detail="Journey not found")
    return journey
