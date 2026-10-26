import time
import logging
from collections import defaultdict
from fastapi import APIRouter, HTTPException, Depends, Request, status
from typing import List, Dict, Any, Optional
from app.services.ai_service import AIService
from app.models.schemas import AIRequest, AIResponse
from app.routers.auth import get_current_user_optional

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/ai", tags=["AI Travel Assistant"])

_ai_rate_limits = defaultdict(list)

def check_ai_rate_limit(request: Request, max_requests: int = 25, window_seconds: int = 60) -> None:
    client_ip = request.client.host if request.client else "unknown"
    key = f"ai_chat:{client_ip}"
    now = time.time()
    
    recent = [t for t in _ai_rate_limits[key] if now - t < window_seconds]
    if len(recent) >= max_requests:
        logger.warning(f"AI rate limit exceeded for IP {client_ip}")
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"You've sent several requests in a short time. Please wait {window_seconds} seconds so I can recharge and assist you properly.",
            headers={"Retry-After": str(window_seconds)}
        )
    recent.append(now)
    _ai_rate_limits[key] = recent

@router.post("/chat", response_model=AIResponse)
async def chat_with_assistant(
    request: Request,
    ai_request: AIRequest,
    current_user: Optional[Dict[str, Any]] = Depends(get_current_user_optional)
) -> Dict[str, Any]:
    check_ai_rate_limit(request, max_requests=25, window_seconds=60)
    user_id = current_user.get("id") if current_user else None
    user_email = current_user.get("email") if current_user else None
    return await AIService.process_user_prompt(
        prompt=ai_request.prompt,
        current_search=ai_request.current_search,
        active_filters=ai_request.active_filters,
        user_id=user_id,
        user_email=user_email
    )

@router.get("/quick-prompts")
async def get_quick_prompts() -> List[Dict[str, str]]:
    return [
        {"label": "Cheapest under ₹1,000", "prompt": "Find the cheapest journey from Bengaluru to Chennai tomorrow under ₹1,000."},
        {"label": "Arrive before 10:00 AM", "prompt": "Show journeys from Bengaluru to Chennai arriving before 10:00 AM."},
        {"label": "Train + Cab Connection", "prompt": "Plan a door-to-door journey combining an express train with a cab for the final leg."},
        {"label": "Direct Flights Only", "prompt": "Show direct flights from Delhi to Mumbai under ₹5,000."},
        {"label": "My Bookings", "prompt": "Show my upcoming travel reservations and boarding passes."}
    ]
