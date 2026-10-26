"""
Authentication Service for TripPilot AI
Provides secure password hashing (PBKDF2-HMAC-SHA256),
stateless HMAC-SHA256 signed JWT session tokens,
and seamless user registration/login with Supabase PostgreSQL and local in-memory fallback.
"""

import os
import hmac
import hashlib
import base64
import json
import time
import uuid
import logging
from typing import Dict, Any, Optional
from datetime import datetime, timezone

from app.config import settings
from app.supabase_client import supabase_client

logger = logging.getLogger(__name__)

def _base64url_encode(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).decode('utf-8').rstrip('=')

def _base64url_decode(s: str) -> bytes:
    padding = '=' * (4 - (len(s) % 4)) if len(s) % 4 != 0 else ''
    return base64.urlsafe_b64decode(s + padding)

def hash_password(password: str) -> str:
    """Hashes a password with a random 16-byte salt using PBKDF2-HMAC-SHA256"""
    salt = os.urandom(16)
    key = hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'), salt, 100_000)
    return f"{salt.hex()}${key.hex()}"

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifies a plain password against the stored salt$hash"""
    try:
        salt_hex, key_hex = hashed_password.split('$')
        salt = bytes.fromhex(salt_hex)
        expected_key = bytes.fromhex(key_hex)
        actual_key = hashlib.pbkdf2_hmac('sha256', plain_password.encode('utf-8'), salt, 100_000)
        return hmac.compare_digest(actual_key, expected_key)
    except Exception as e:
        logger.warning(f"Password verification error: {e}")
        return False

def create_access_token(user: Dict[str, Any]) -> str:
    """Creates an HMAC-SHA256 signed JWT token valid for settings.TOKEN_EXPIRE_DAYS"""
    header = {"alg": "HS256", "typ": "JWT"}
    now = int(time.time())
    expire = now + (settings.TOKEN_EXPIRE_DAYS * 86400)
    
    payload = {
        "sub": user["id"],
        "email": user["email"],
        "name": user["name"],
        "phone": user.get("phone", ""),
        "iat": now,
        "exp": expire
    }
    
    encoded_header = _base64url_encode(json.dumps(header, separators=(',', ':')).encode('utf-8'))
    encoded_payload = _base64url_encode(json.dumps(payload, separators=(',', ':')).encode('utf-8'))
    
    signing_input = f"{encoded_header}.{encoded_payload}".encode('utf-8')
    signature = hmac.new(settings.SECRET_KEY.encode('utf-8'), signing_input, hashlib.sha256).digest()
    encoded_signature = _base64url_encode(signature)
    
    return f"{encoded_header}.{encoded_payload}.{encoded_signature}"

def decode_access_token(token: str) -> Optional[Dict[str, Any]]:
    """Decodes and verifies HMAC-SHA256 signed JWT token"""
    try:
        parts = token.strip().split('.')
        if len(parts) != 3:
            return None
        
        encoded_header, encoded_payload, encoded_signature = parts
        signing_input = f"{encoded_header}.{encoded_payload}".encode('utf-8')
        expected_sig = hmac.new(settings.SECRET_KEY.encode('utf-8'), signing_input, hashlib.sha256).digest()
        actual_sig = _base64url_decode(encoded_signature)
        
        if not hmac.compare_digest(actual_sig, expected_sig):
            logger.warning("Invalid JWT signature")
            return None
        
        payload_bytes = _base64url_decode(encoded_payload)
        payload = json.loads(payload_bytes.decode('utf-8'))
        
        # Expiry check
        if payload.get("exp", 0) < int(time.time()):
            logger.info("JWT token has expired")
            return None
            
        return payload
    except Exception as e:
        logger.warning(f"Error decoding token: {e}")
        return None

# Pre-seeded users for immediate testing and prototype resilience
_in_memory_users: Dict[str, Dict[str, Any]] = {
    "user_demo_1": {
        "id": "user_demo_1",
        "name": "Rahul Nair",
        "email": "rahul.nair@example.com",
        "phone": "+91 98450 12345",
        "password_hash": hash_password("password123"),
        "avatar_url": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200",
        "created_at": "2026-01-15T10:00:00Z"
    },
    "user_demo_2": {
        "id": "user_demo_2",
        "name": "Priya Sharma",
        "email": "priya.sharma@example.com",
        "phone": "+91 98765 43210",
        "password_hash": hash_password("password123"),
        "avatar_url": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200",
        "created_at": "2026-02-01T12:00:00Z"
    }
}

class AuthService:
    @classmethod
    async def register(cls, name: str, email: str, password: str, phone: Optional[str] = None) -> Dict[str, Any]:
        """Registers a new user and generates a session token"""
        clean_email = email.strip().lower()
        
        # Check in memory
        for u in _in_memory_users.values():
            if u["email"].lower() == clean_email:
                raise ValueError("An account with this email address already exists. Please sign in instead.")
        
        # Check in Supabase if configured
        if supabase_client:
            try:
                res = supabase_client.table("users").select("id").eq("email", clean_email).execute()
                if res.data and len(res.data) > 0:
                    raise ValueError("An account with this email address already exists. Please sign in instead.")
            except Exception as e:
                logger.warning(f"Supabase user lookup exception (continuing with local store): {e}")

        user_id = f"user_{uuid.uuid4().hex[:12]}"
        pwd_hash = hash_password(password)
        created_at = datetime.now(timezone.utc).isoformat()
        
        user_record = {
            "id": user_id,
            "name": name.strip(),
            "email": clean_email,
            "phone": (phone or "").strip(),
            "password_hash": pwd_hash,
            "avatar_url": None,
            "created_at": created_at
        }
        
        # Save in memory
        _in_memory_users[user_id] = user_record
        
        # Save in Supabase if configured
        if supabase_client:
            try:
                supabase_client.table("users").insert(user_record).execute()
            except Exception as e:
                logger.warning(f"Could not persist user to Supabase (using in-memory): {e}")

        public_user = cls._sanitize_user(user_record)
        token = create_access_token(public_user)
        return {
            "user": public_user,
            "token": token,
            "message": "Account created successfully"
        }

    @classmethod
    async def login(cls, email: str, password: str) -> Dict[str, Any]:
        """Authenticates user with email and password"""
        clean_email = email.strip().lower()
        user_record = None
        
        # Check in-memory store
        for u in _in_memory_users.values():
            if u["email"].lower() == clean_email:
                user_record = u
                break
                
        # Check Supabase if not found or sync
        if not user_record and supabase_client:
            try:
                res = supabase_client.table("users").select("*").eq("email", clean_email).execute()
                if res.data and len(res.data) > 0:
                    user_record = res.data[0]
                    _in_memory_users[user_record["id"]] = user_record
            except Exception as e:
                logger.warning(f"Supabase login lookup exception: {e}")

        if not user_record:
            raise ValueError("No account found with this email address. Please check your spelling or create a new account.")
            
        if not verify_password(password, user_record.get("password_hash", "")):
            raise ValueError("Incorrect password. Please verify your credentials and try again.")

        public_user = cls._sanitize_user(user_record)
        token = create_access_token(public_user)
        return {
            "user": public_user,
            "token": token,
            "message": "Signed in successfully"
        }

    @classmethod
    async def get_user_by_id(cls, user_id: str) -> Optional[Dict[str, Any]]:
        """Retrieves user profile by ID"""
        if user_id in _in_memory_users:
            return cls._sanitize_user(_in_memory_users[user_id])
            
        if supabase_client:
            try:
                res = supabase_client.table("users").select("*").eq("id", user_id).execute()
                if res.data and len(res.data) > 0:
                    u = res.data[0]
                    _in_memory_users[u["id"]] = u
                    return cls._sanitize_user(u)
            except Exception as e:
                logger.warning(f"Supabase get_user_by_id error: {e}")
                
        return None

    @classmethod
    async def get_user_from_token(cls, token: str) -> Optional[Dict[str, Any]]:
        """Validates token and returns current user"""
        payload = decode_access_token(token)
        if not payload or "sub" not in payload:
            return None
        return await cls.get_user_by_id(payload["sub"])

    @staticmethod
    def _sanitize_user(user: Dict[str, Any]) -> Dict[str, Any]:
        """Strips sensitive fields like password_hash"""
        return {
            "id": user["id"],
            "name": user["name"],
            "email": user["email"],
            "phone": user.get("phone"),
            "avatar_url": user.get("avatar_url"),
            "created_at": user.get("created_at")
        }
