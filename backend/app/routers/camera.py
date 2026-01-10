"""
Camera router for MJPEG video streaming.
"""

from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from app.services.camera import camera_service

router = APIRouter(prefix="/api/camera", tags=["camera"])


@router.get("/stream")
async def camera_stream():
    """
    MJPEG video stream endpoint.

    Returns:
        StreamingResponse: MJPEG stream with multipart/x-mixed-replace content type
    """
    return StreamingResponse(
        camera_service.generate_mjpeg_frames(),
        media_type="multipart/x-mixed-replace; boundary=frame"
    )
