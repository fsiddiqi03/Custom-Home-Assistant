"""
Calendar router for Google Calendar integration.
Phase 7 - Placeholder implementation.
"""

from fastapi import APIRouter
from app.models.schemas import CalendarResponse
from datetime import datetime

router = APIRouter(prefix="/api/calendar", tags=["calendar"])


@router.get("/today", response_model=CalendarResponse)
async def get_today_events():
    """
    Get today's calendar events from Google Calendar.

    Note: This is a Phase 7 feature. Currently returns empty events.
    Full implementation will be added in Phase 7.

    Returns:
        CalendarResponse: List of today's events
    """
    # TODO: Phase 7 - Implement Google Calendar API integration
    return CalendarResponse(
        events=[],
        date=datetime.now().strftime("%Y-%m-%d")
    )
