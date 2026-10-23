from fastapi import APIRouter, HTTPException, Body
from typing import List, Dict, Any
from app.services.multimodal_service import MultimodalService
from app.models.schemas import JourneyLeg

router = APIRouter(prefix="/api/multimodal", tags=["Multimodal"])

@router.post("/plan")
async def plan_multimodal(legs: List[JourneyLeg] = Body(..., min_items=1, max_items=8)) -> Dict[str, Any]:
    try:
        return MultimodalService.compose_multimodal_journey([leg.dict() for leg in legs])
    except ValueError as val_err:
        raise HTTPException(status_code=400, detail=str(val_err))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to plan multimodal itinerary: {str(e)}")
