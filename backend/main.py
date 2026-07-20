"""
FastAPI application entrypoint. Wires up middleware, mounts the versioned
API router, and manages database lifecycle via the lifespan context.
"""
import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.api import api_router
from app.core.config import settings
from app.core.database import create_all_tables, init_mongo

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        create_all_tables()
    except Exception:  # noqa: BLE001
        logger.warning("Skipping create_all_tables: database not reachable at startup", exc_info=True)

    try:
        await init_mongo()
    except Exception:  # noqa: BLE001
        logger.warning("Skipping Mongo initialization: database not reachable at startup", exc_info=True)

    yield
    # Shutdown (add connection cleanup here if needed)


app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

if settings.BACKEND_CORS_ORIGINS:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[str(origin) for origin in settings.BACKEND_CORS_ORIGINS],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

app.include_router(api_router, prefix=settings.API_V1_STR)


@app.get("/health", tags=["Health"])
def health_check():
    return {"status": "ok", "environment": settings.ENVIRONMENT}
