"""
Video recorder service.
Handles recording frames and uploading to S3.
"""

import time
from typing import List
from app.config import settings
from app.services.camera import camera_service
from app.services.s3 import s3_service


async def record_and_upload() -> bool:
    """
    Record video clip and upload to S3.
    This function will be run in a thread to avoid blocking.

    Returns:
        bool: True if recording and upload successful
    """
    print("Recording video clip...")
    frames = []
    fps = settings.recording_fps
    duration = settings.recording_duration
    total_frames = fps * duration

    try:
        # Capture frames
        for i in range(total_frames):
            frame = camera_service.capture_frame()
            frames.append(frame)
            time.sleep(1 / fps)

        print(f"Captured {len(frames)} frames. Uploading to S3...")

        # Upload to S3
        if s3_service.upload_video(frames, fps):
            print("Video uploaded successfully!")
            return True
        else:
            print("Failed to upload video")
            return False

    except Exception as e:
        print(f"Error during recording/upload: {e}")
        return False
