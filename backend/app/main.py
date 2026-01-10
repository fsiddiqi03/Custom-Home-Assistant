"""
FastAPI main application.
Home Dashboard backend with camera streaming, person detection, and monitoring.
"""

import asyncio
import time
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.models.schemas import HealthResponse
from app.services.camera import camera_service
from app.tasks.detection_loop import detection_loop

# Import routers
from app.routers import camera, alerts, stats, calendar

# Track application start time for uptime
start_time = time.time()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Lifespan context manager for startup and shutdown events.
    Handles camera initialization and background detection loop.
    """
    # Startup
    print("Starting Home Dashboard Backend...")

    # Initialize camera
    print("Initializing camera...")
    camera_service.start()

    # Start background detection loop
    print("Starting background detection task...")
    detection_task = asyncio.create_task(detection_loop.start())

    yield

    # Shutdown
    print("Shutting down Home Dashboard Backend...")

    # Stop detection loop
    detection_loop.stop()
    detection_task.cancel()
    try:
        await detection_task
    except asyncio.CancelledError:
        print("Detection task cancelled successfully")

    # Stop camera
    camera_service.stop()

    print("Shutdown complete")


# Create FastAPI app
app = FastAPI(
    title="Home Dashboard API",
    description="Backend API for home automation dashboard with camera monitoring",
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, restrict this to specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(camera.router)
app.include_router(alerts.router)
app.include_router(stats.router)
app.include_router(calendar.router)


@app.get("/health", response_model=HealthResponse)
async def health_check():
    """
    Health check endpoint.

    Returns:
        HealthResponse: Status and uptime information
    """
    uptime = time.time() - start_time
    return HealthResponse(
        status="ok",
        uptime=uptime
    )


@app.get("/")
async def root():
    """
    Root endpoint.

    Returns:
        dict: Welcome message and API information
    """
    return {
        "message": "Home Dashboard API",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/health"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host=settings.host,
        port=settings.port,
        reload=False  # Set to True for development
    )
