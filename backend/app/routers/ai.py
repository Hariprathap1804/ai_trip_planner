from fastapi import APIRouter
from typing import List, Dict, Any
from app.services.ai_service import AIService
from app.models.schemas import AIRequest, AIResponse

router = APIRouter(prefix="/api/ai", tags=["AI Travel Assistant"])

@router.post("/chat", response_model=AIResponse)
async def chat_with_assistant(request: AIRequest) -> Dict[str, Any]:
    return await AIService.process_user_prompt(
        prompt=request.prompt,
        current_search=request.current_search,
        active_filters=request.active_filters
    )

@router.get("/quick-prompts")
async def get_quick_prompts() -> List[Dict[str, str]]:
    return [
        {"label": "Cheapest to Chennai", "prompt": "Find the cheapest way to travel from Bengaluru to Chennai tomorrow under ₹1,000."},
        {"label": "Arrive Before 10 AM", "prompt": "Show fastest journeys from Bengaluru to Chennai arriving before 10 AM."},
        {"label": "Multimodal Route", "prompt": "Plan a multimodal journey with cab for last mile and train for long distance."},
        {"label": "Direct Flights Only", "prompt": "Show non-stop direct flights under ₹6,000."},
        {"label": "My Bookings", "prompt": "Show my upcoming demo bookings and their current status."}
    ]
