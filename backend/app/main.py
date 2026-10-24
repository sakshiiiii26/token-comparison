from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.api.auth import router as auth_router
from app.api.super_admin import router as super_admin_router
from app.api.client_admin import router as client_admin_router
from app.api.employee import router as employee_router
from app.api.models import router as models_router
from app.services.seed_service import create_super_admin
from app.api.token import router as token_router
from app.api.usage_log import router as usage_log_router
from app.api.recommendation import router as recommendation_router
from app.api.chat import router as chat_router
from app.api.notification import router as notification_router

app = FastAPI(
    title="Binjwa AI Cost Platform",
    version="1.0.0"
)

# Configure CORS
cors_origins_raw = getattr(settings, "CORS_ORIGINS", "*")
if cors_origins_raw and cors_origins_raw.strip() != "*":
    origins = [orig.strip() for orig in cors_origins_raw.split(",") if orig.strip()]
    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
else:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

# Routers
app.include_router(auth_router)
app.include_router(super_admin_router)
app.include_router(client_admin_router)
app.include_router(employee_router)
app.include_router(models_router)
app.include_router(token_router)
app.include_router(usage_log_router)
app.include_router(recommendation_router)
app.include_router(chat_router)
app.include_router(notification_router)

# Startup Event
@app.on_event("startup")
def startup():
    try:
        create_super_admin()
    except Exception as e:
        print(f"⚠️ Warning: Auto-seed on startup failed: {e}")


# Home API
@app.get("/")
def home():
    return {
        "message": "Welcome to Binjwa AI Cost Platform 🚀",
        "docs": "/docs",
        "health": "/health"
    }


# Health API with MongoDB connectivity check
@app.get("/health")
def health():
    db_status = "healthy"
    try:
        from app.database.mongodb import client
        client.admin.command('ping')
    except Exception as e:
        db_status = f"unhealthy: {str(e)}"

    return {
        "status": "Running Successfully" if db_status == "healthy" else "Degraded",
        "database": db_status
    }