from fastapi import APIRouter, HTTPException, Body
from typing import List, Dict, Any
from app.services.multimodal_service import MultimodalService

router = APIRouter(prefix="/api/multimodal", tags=["Multimodal"])

@router.post("/plan")
async def plan_multimodal(legs: List[Dict[str, Any]] = Body(...)) -> Dict[str, Any]:
    try:
        return MultimodalService.compose_multimodal_journey(legs)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
