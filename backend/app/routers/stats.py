"""
Stats router for system statistics.
"""

from fastapi import APIRouter
from app.models.schemas import PiStatsResponse
from app.services.pi_stats import get_pi_stats

router = APIRouter(prefix="/api", tags=["stats"])


@router.get("/stats", response_model=PiStatsResponse)
async def get_stats():
    """
    Get Pi1 system statistics.

    Returns:
        PiStatsResponse: CPU temp, CPU usage, RAM usage, disk usage
    """
    return get_pi_stats()
