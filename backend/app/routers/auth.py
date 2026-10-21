"""
Authentication Router for TripPilot AI
Endpoints:
- POST /api/auth/register: Create user account & receive session token
- POST /api/auth/login: Authenticate user & receive session token
- GET /api/auth/me: Verify active session & retrieve current user profile
"""

import logging
from typing import Dict, Any, Optional
from fastapi import APIRouter, HTTPException, Header, Depends, status
from app.models.schemas import UserRegister, UserLogin, AuthResponse, UserResponse
from app.services.auth_service import AuthService

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

async def get_current_user_optional(authorization: Optional[str] = Header(None)) -> Optional[Dict[str, Any]]:
    """Extracts and verifies the user from Authorization: Bearer <token> if present"""
    if not authorization:
        return None
    try:
        scheme, _, token = authorization.partition(" ")
        if scheme.lower() != "bearer" or not token:
            return None
        return await AuthService.get_user_from_token(token)
    except Exception as e:
        logger.warning(f"Error parsing authorization header: {e}")
        return None

async def get_current_user_required(user: Optional[Dict[str, Any]] = Depends(get_current_user_optional)) -> Dict[str, Any]:
    """Requires an authenticated user, otherwise raises 401 Unauthorized"""
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required. Please log in or sign up to book tickets."
        )
    return user

@router.post("/register", response_model=AuthResponse)
async def register(payload: UserRegister) -> Dict[str, Any]:
    """Register a new user account"""
    try:
        result = await AuthService.register(
            name=payload.name,
            email=payload.email,
            password=payload.password,
            phone=payload.phone
        )
        return result
    except ValueError as val_err:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(val_err)
        )
    except Exception as e:
        logger.error(f"Registration failure: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred during registration. Please try again."
        )

@router.post("/login", response_model=AuthResponse)
async def login(payload: UserLogin) -> Dict[str, Any]:
    """Login with email and password"""
    try:
        result = await AuthService.login(
            email=payload.email,
            password=payload.password
        )
        return result
    except ValueError as val_err:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(val_err)
        )
    except Exception as e:
        logger.error(f"Login failure: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred during login. Please try again."
        )

@router.get("/me")
async def get_me(current_user: Dict[str, Any] = Depends(get_current_user_required)) -> Dict[str, Any]:
    """Returns the authenticated user's profile"""
    return {
        "success": True,
        "user": current_user
    }
