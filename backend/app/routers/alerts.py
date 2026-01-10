"""
Alerts router for listing security camera alerts/videos from S3.
"""

from fastapi import APIRouter, Query
from typing import Optional
from app.models.schemas import AlertsListResponse
from app.services.s3 import s3_service

router = APIRouter(prefix="/api", tags=["alerts"])


@router.get("/alerts", response_model=AlertsListResponse)
async def get_alerts(
    start_date: Optional[str] = Query(None, description="Start date filter (YYYY-MM-DD)"),
    end_date: Optional[str] = Query(None, description="End date filter (YYYY-MM-DD)")
):
    """
    List all alert videos from S3 with optional date range filtering.

    Args:
        start_date: Optional start date (YYYY-MM-DD)
        end_date: Optional end date (YYYY-MM-DD)

    Returns:
        AlertsListResponse: List of alerts with presigned URLs
    """
    alerts = s3_service.list_videos(start_date, end_date)
    return AlertsListResponse(alerts=alerts)
