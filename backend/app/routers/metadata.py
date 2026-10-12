from fastapi import APIRouter
from typing import List, Dict, Any
from app.supabase_client import DatabaseRepository

router = APIRouter(prefix="/api/metadata", tags=["Metadata"])

@router.get("/cities")
async def get_cities() -> List[Dict[str, Any]]:
    return await DatabaseRepository.get_all_hubs()

@router.get("/modes")
async def get_supported_modes() -> List[Dict[str, Any]]:
    return [
        {"id": "flight", "label": "Flights", "icon": "Plane", "description": "Domestic & international air routes"},
        {"id": "train", "label": "Trains", "icon": "Train", "description": "Express, Vande Bharat, and Mail services"},
        {"id": "metro", "label": "Metro", "icon": "Subway", "description": "Urban rapid transit lines"},
        {"id": "bus", "label": "Buses", "icon": "Bus", "description": "City, intercity AC, and sleeper buses"},
        {"id": "cab", "label": "Cabs", "icon": "Car", "description": "On-demand sedans, SUVs, and EVs"},
        {"id": "auto", "label": "Autos", "icon": "Navigation", "description": "Short-distance 3-wheeler auto rickshaws"}
    ]
