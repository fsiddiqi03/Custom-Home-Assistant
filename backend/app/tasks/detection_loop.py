"""
Background detection loop task.
Periodically checks for person detection and triggers recording/upload.
"""

import asyncio
import time
from app.config import settings
from app.services.camera import camera_service
from app.services.detection import detect_person_lambda
from app.services.recorder import record_and_upload


class DetectionLoop:
    """Background task for person detection"""

    def __init__(self):
        self.running = False
        self.last_check_time = 0
        self.last_upload_time = 0
        self.is_recording = False
        self.person_present = False
        self._lock = asyncio.Lock()

    async def start(self):
        """Start the detection loop"""
        self.running = True
        print("Starting detection loop...")

        while self.running:
            try:
                await self._check_and_process()
            except Exception as e:
                print(f"Error in detection loop: {e}")

            # Sleep briefly to avoid busy loop
            await asyncio.sleep(1)

    async def _check_and_process(self):
        """Check for person and process detection"""
        current_time = time.time()

        # Determine check interval based on person presence
        if self.person_present:
            check_interval = settings.active_check_interval
        else:
            check_interval = settings.detection_check_interval

        # Check if it's time for another detection check
        if current_time - self.last_check_time >= check_interval:
            self.last_check_time = current_time

            # Capture frame and check for person (in thread to avoid blocking)
            frame = await asyncio.to_thread(camera_service.capture_frame)

            print(f"Checking for person... (interval: {check_interval}s)")
            person_detected = await asyncio.to_thread(detect_person_lambda, frame)

            if person_detected:
                print("Person detected!")
                self.person_present = True

                # Check if we can upload (cooldown period)
                if current_time - self.last_upload_time >= settings.detection_cooldown:
                    async with self._lock:
                        if not self.is_recording:
                            print("Triggering recording!")
                            self.is_recording = True
                            self.last_upload_time = current_time

                            # Record and upload in background thread
                            await asyncio.to_thread(self._record_and_upload_sync)
                else:
                    time_left = int(settings.detection_cooldown - (current_time - self.last_upload_time))
                    print(f"Cooldown active. Next upload in {time_left}s")
            else:
                if self.person_present:
                    print("Person no longer detected")
                self.person_present = False

    def _record_and_upload_sync(self):
        """Synchronous wrapper for recording and upload"""
        try:
            # Run the async function in a new event loop (blocking call)
            asyncio.run(record_and_upload())
        except Exception as e:
            print(f"Error during recording/upload: {e}")
        finally:
            self.is_recording = False

    def stop(self):
        """Stop the detection loop"""
        print("Stopping detection loop...")
        self.running = False


# Global detection loop instance
detection_loop = DetectionLoop()
