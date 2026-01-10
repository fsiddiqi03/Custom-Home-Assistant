"""
Pydantic models for request/response schemas
"""

from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime


# Alert Schemas
class AlertResponse(BaseModel):
    """Individual alert/video object"""
    filename: str
    url: str
    timestamp: str


class AlertsListResponse(BaseModel):
    """List of alerts response"""
    alerts: List[AlertResponse]


# Stats Schemas
class PiStatsResponse(BaseModel):
    """System statistics for a Raspberry Pi"""
    cpu_temp: int
    cpu_usage: float
    ram_usage: float
    disk_usage: float


# Calendar Schemas
class CalendarEvent(BaseModel):
    """Individual calendar event"""
    id: str
    title: str
    start: str
    end: str
    location: Optional[str] = None


class CalendarResponse(BaseModel):
    """Calendar events for today"""
    events: List[CalendarEvent]
    date: str


# Health Check Schema
class HealthResponse(BaseModel):
    """Health check response"""
    status: str
    uptime: float


# Detection State (Internal)
class DetectionState(BaseModel):
    """Internal state for person detection"""
    last_check_time: float = 0
    last_upload_time: float = 0
    is_recording: bool = False
    person_present: bool = False
