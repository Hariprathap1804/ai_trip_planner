from fastapi import APIRouter, Query, HTTPException
from typing import List, Optional, Dict, Any
from app.services.journey_service import JourneyService
from app.models.schemas import SearchFilters

router = APIRouter(prefix="/api/journeys", tags=["Journeys"])

@router.get("/search")
async def search_journeys(
    origin: str = Query("Bengaluru", description="Origin city or transit hub"),
    destination: str = Query("Chennai", description="Destination city or transit hub"),
    date: Optional[str] = Query(None, description="Travel date YYYY-MM-DD"),
    modes: Optional[List[str]] = Query(None, description="Filter by transportation modes"),
    min_budget: Optional[float] = Query(None),
    max_budget: Optional[float] = Query(None),
    max_duration: Optional[int] = Query(None),
    flight_direct_only: Optional[bool] = Query(None),
    bus_ac_only: Optional[bool] = Query(None),
    sort_by: Optional[str] = Query("recommended", description="Sorting option")
) -> List[Dict[str, Any]]:
    filters = SearchFilters(
        min_budget=min_budget,
        max_budget=max_budget,
        max_duration_minutes=max_duration,
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
async def get_journey(journey_id: str) -> Dict[str, Any]:
    journey = await JourneyService.get_journey_by_id(journey_id)
    if not journey:
        raise HTTPException(status_code=404, detail="Journey not found")
    return journey
