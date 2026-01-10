"""
Camera service using Picamera2 with singleton pattern.
Provides frame capture and MJPEG stream generation.
"""

import cv2
import time
from typing import Generator


class CameraService:
    """Singleton camera service for Picamera2"""

    _instance = None
    _camera = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance

    def start(self):
        """Initialize and start the camera"""
        if self._camera is None:
            try:
                from picamera2 import Picamera2

                self._camera = Picamera2()
                config = self._camera.create_video_configuration(
                    main={"size": (640, 480)}
                )
                self._camera.configure(config)
                self._camera.start()
                print("Camera started successfully")
            except Exception as e:
                print(f"Error starting camera: {e}")
                raise

    def stop(self):
        """Stop the camera"""
        if self._camera is not None:
            try:
                self._camera.stop()
                self._camera = None
                print("Camera stopped successfully")
            except Exception as e:
                print(f"Error stopping camera: {e}")

    def capture_frame(self):
        """
        Capture a single frame from the camera.

        Returns:
            numpy.ndarray: The captured frame
        """
        if self._camera is None:
            raise RuntimeError("Camera not started")
        return self._camera.capture_array()

    def generate_mjpeg_frames(self) -> Generator[bytes, None, None]:
        """
        Generate MJPEG frames for streaming.

        Yields:
            bytes: MJPEG frame data with boundary markers
        """
        while True:
            try:
                # Capture frame
                frame = self.capture_frame()

                # Convert RGB to BGR for OpenCV
                frame_bgr = cv2.cvtColor(frame, cv2.COLOR_RGB2BGR)

                # Encode as JPEG
                ret, buffer = cv2.imencode('.jpg', frame_bgr)
                if not ret:
                    continue

                frame_bytes = buffer.tobytes()

                # Yield frame with MJPEG boundary
                yield (
                    b'--frame\r\n'
                    b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n'
                )

                # ~10fps to reduce CPU load
                time.sleep(0.1)

            except Exception as e:
                print(f"Error generating frame: {e}")
                time.sleep(1)  # Wait before retrying


# Global camera service instance
camera_service = CameraService()
