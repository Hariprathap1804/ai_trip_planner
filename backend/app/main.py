from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.routers import journeys, multimodal, bookings, ai, metadata, payments, auth

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="TripPilot AI: AI-Powered Multimodal Travel Platform API with Supabase and Seeded Engine"
)

from fastapi import Request
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError

# Human-readable Validation Error Handler
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    errors = exc.errors()
    messages = []
    clean_errors = []
    for err in errors:
        msg = err.get("msg", "Validation error")
        msg = msg.removeprefix("Value error, ")
        field = err.get("loc", [])
        field_name = str(field[-1]) if field else "field"
        messages.append(f"{field_name}: {msg}")
        clean_errors.append({
            "field": field_name,
            "message": msg,
            "type": err.get("type", "validation_error")
        })
    
    summary = ". ".join(messages)
    return JSONResponse(
        status_code=422,
        content={"detail": summary, "errors": clean_errors}
    )

# OWASP Recommended Security Headers Middleware
@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Permissions-Policy"] = "geolocation=(), microphone=(), camera=()"
    return response

# CORS Configuration (Restricted strictly to configured domains & scoped owner preview deployments)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.get_cors_origins(),
    allow_origin_regex=r"^https://ai[-_]trip[-_]planner(-[a-zA-Z0-9_\-]+)?-hariprathap1804.*\.vercel\.app$",
    allow_credentials=True,
    allow_methods=["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization", "Accept", "Origin", "X-Requested-With"],
    expose_headers=["Retry-After", "X-Content-Type-Options"],
    max_age=7200,
)

# Mount Routers
app.include_router(auth.router)
app.include_router(metadata.router)
app.include_router(journeys.router)
app.include_router(multimodal.router)
app.include_router(bookings.router)
app.include_router(payments.router)
app.include_router(ai.router)

@app.get("/api/health", tags=["Health"])
async def health_check():
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "supabase_configured": bool(settings.SUPABASE_URL and "your-project" not in settings.SUPABASE_URL),
        "environment": settings.ENVIRONMENT
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host=settings.HOST, port=settings.PORT, reload=True)
