# Home Dashboard - Project Context

## Overview

A modern, locally-hosted home automation dashboard built with FastAPI backend and Next.js frontend. The system consolidates smart home controls (Hue/Govee lights via external API), security camera monitoring with AI person detection, environmental sensors, and system health monitoring into a single interface optimized for wall-mounted Raspberry Pi displays and mobile access via Tailscale VPN.

This is a **monorepo** containing both backend and frontend.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           NETWORK (Tailscale VPN)                           │
└─────────────────────────────────────────────────────────────────────────────┘
                    │                                       │
                    ▼                                       ▼
┌───────────────────────────────────────┐    ┌────────────────────────────────┐
│              PI1 (Main Server)        │    │        PI2 (HomeAPI)           │
├───────────────────────────────────────┤    │      (Built Separately)        │
│                                       │    ├────────────────────────────────┤
│  ┌─────────────────────────────────┐  │    │                                │
│  │   Next.js Frontend (:3000)      │  │    │  Wraps Hue + Govee APIs:       │
│  │   • Dashboard UI                │  │    │  • GET  /api/lights            │
│  │   • API Proxy → /api/*          │  │    │  • GET  /api/lights/:id        │
│  │   • Static assets               │  │    │  • POST /api/lights/:id/state  │
│  └─────────────┬───────────────────┘  │    │  • POST /api/lights/:id/       │
│                │                      │    │        brightness              │
│                ▼                      │    │  • GET  /api/temp              │
│  ┌─────────────────────────────────┐  │    │  • GET  /api/stats             │
│  │   FastAPI Backend (:8000)       │  │    │                                │
│  │                                 │  │    └────────────────────────────────┘
│  │   • GET  /api/camera/stream ◄───────────────────────┘
│  │   • GET  /api/alerts            │  │
│  │   • GET  /api/stats             │  │
│  │   • GET  /api/calendar/today    │  │
│  │                                 │  │
│  │   Background Tasks:             │  │
│  │   • Person detection loop       │  │
│  │   • Recording & S3 upload       │  │
│  └─────────────────────────────────┘  │
│                                       │
│  ┌─────────────────────────────────┐  │
│  │   Hardware                      │  │
│  │   • Pi Camera 3 (Picamera2)     │  │
│  └─────────────────────────────────┘  │
│                │                      │
└────────────────┼──────────────────────┘
                 │
                 ▼
┌────────────────────────────────────────┐
│            AWS Cloud                   │
│  • Lambda (YOLO person detection)      │
│  • S3 (video storage)                  │
│  • SES (email notifications)           │
└────────────────────────────────────────┘
```

---

## Project Structure

```
home-dashboard/
├── backend/                          # FastAPI (Pi1)
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py                   # FastAPI app + lifespan
│   │   ├── config.py                 # Pydantic Settings from .env
│   │   ├── routers/
│   │   │   ├── __init__.py
│   │   │   ├── camera.py             # /api/camera/stream
│   │   │   ├── alerts.py             # /api/alerts
│   │   │   ├── stats.py              # /api/stats
│   │   │   └── calendar.py           # /api/calendar/today
│   │   ├── services/
│   │   │   ├── __init__.py
│   │   │   ├── camera.py             # Picamera2 singleton + frame gen
│   │   │   ├── detection.py          # Lambda detection logic
│   │   │   ├── recorder.py           # Recording + S3 upload
│   │   │   ├── s3.py                 # S3 client + list/upload
│   │   │   ├── pi_stats.py           # System stats
│   │   │   └── google_calendar.py    # Google Calendar API
│   │   ├── tasks/
│   │   │   ├── __init__.py
│   │   │   └── detection_loop.py     # Background detection task
│   │   └── models/
│   │       ├── __init__.py
│   │       └── schemas.py            # Pydantic models
│   ├── .env.example
│   ├── requirements.txt
│   └── README.md
│
├── frontend/                         # Next.js
│   ├── app/
│   │   ├── layout.tsx                # Root layout + ThemeProvider + Dock
│   │   ├── page.tsx                  # Home dashboard (widgets)
│   │   ├── camera/
│   │   │   └── page.tsx              # Camera feed + alerts
│   │   ├── system/
│   │   │   └── page.tsx              # Pi stats monitoring
│   │   ├── api/                      # Proxy routes to backends
│   │   │   ├── alerts/
│   │   │   │   └── route.ts
│   │   │   ├── stats/
│   │   │   │   ├── pi1/
│   │   │   │   │   └── route.ts
│   │   │   │   └── pi2/
│   │   │   │       └── route.ts
│   │   │   ├── lights/
│   │   │   │   ├── route.ts
│   │   │   │   └── [id]/
│   │   │   │       ├── route.ts
│   │   │   │       ├── state/
│   │   │   │       │   └── route.ts
│   │   │   │       └── brightness/
│   │   │   │           └── route.ts
│   │   │   ├── temp/
│   │   │   │   └── route.ts
│   │   │   └── calendar/
│   │   │       └── route.ts
│   │   └── globals.css
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Dock.tsx              # macOS-style bottom nav
│   │   │   ├── WidgetGrid.tsx        # Draggable grid container
│   │   │   └── ThemeToggle.tsx       # Dark/light mode switch
│   │   ├── widgets/
│   │   │   ├── Widget.tsx            # Base widget wrapper
│   │   │   ├── LightWidget.tsx       # Individual light control
│   │   │   ├── TempWidget.tsx        # Temperature display
│   │   │   └── CalendarWidget.tsx    # Today's events
│   │   ├── camera/
│   │   │   ├── LiveFeed.tsx          # MJPEG stream (direct to FastAPI)
│   │   │   ├── AlertList.tsx         # Alert history grid
│   │   │   ├── AlertFilters.tsx      # Date range picker
│   │   │   └── AlertModal.tsx        # Video playback modal
│   │   ├── system/
│   │   │   ├── PiStatCard.tsx        # Individual Pi stats
│   │   │   └── StatBar.tsx           # Progress bar component
│   │   └── ui/
│   │       ├── Button.tsx
│   │       ├── Slider.tsx
│   │       ├── Toggle.tsx
│   │       ├── Card.tsx
│   │       └── Skeleton.tsx
│   ├── lib/
│   │   ├── api.ts                    # API client functions
│   │   ├── hooks/
│   │   │   ├── useLights.ts
│   │   │   ├── useTemp.ts
│   │   │   ├── useAlerts.ts
│   │   │   ├── useStats.ts
│   │   │   └── useLayout.ts
│   │   └── utils/
│   │       ├── constants.ts
│   │       └── cn.ts
│   ├── types/
│   │   └── index.ts
│   ├── public/
│   │   └── icons/
│   ├── .env.example
│   ├── tailwind.config.ts
│   ├── next.config.js
│   └── package.json
│
├── scripts/
│   ├── start-backend.sh
│   ├── start-frontend.sh
│   └── setup.sh
│
├── .gitignore
├── CLAUDE.md
└── README.md
```

---

## Tech Stack

### Backend (FastAPI)
- **Framework**: FastAPI >= 0.109.0
- **Server**: Uvicorn
- **Camera**: Picamera2
- **Image Processing**: OpenCV (opencv-python-headless)
- **AWS**: boto3 (S3, presigned URLs)
- **HTTP Client**: requests (for Lambda calls)
- **System Stats**: psutil, gpiozero
- **Config**: pydantic-settings, python-dotenv
- **Google Calendar**: google-api-python-client, google-auth-oauthlib

### Frontend (Next.js)
- **Framework**: Next.js 14+ (App Router)
- **Styling**: Tailwind CSS
- **Data Fetching**: SWR
- **Drag & Drop**: @dnd-kit/core
- **Theme**: next-themes
- **Icons**: Lucide React

---

## API Contracts

### Pi1 FastAPI Backend (Port 8000)

| Endpoint | Method | Description | Request | Response |
|----------|--------|-------------|---------|----------|
| `/api/camera/stream` | GET | MJPEG video stream | - | `multipart/x-mixed-replace` |
| `/api/alerts` | GET | List alerts from S3 | `?start_date=YYYY-MM-DD&end_date=YYYY-MM-DD` | `{ alerts: [...] }` |
| `/api/stats` | GET | Pi1 system stats | - | `{ cpu_temp, cpu_usage, ram_usage, disk_usage }` |
| `/api/calendar/today` | GET | Today's calendar events | - | `{ events: [...], date }` |
| `/health` | GET | Health check | - | `{ status: "ok", uptime }` |

#### Response Schemas

**Alert Object:**
```json
{
  "filename": "20250109_143022.mp4",
  "url": "https://s3.../presigned-url",
  "timestamp": "2025-01-09T14:30:22"
}
```

**Stats Object:**
```json
{
  "cpu_temp": 45,
  "cpu_usage": 23.5,
  "ram_usage": 52.1,
  "disk_usage": 68.0
}
```

**Calendar Event Object:**
```json
{
  "id": "abc123",
  "title": "Team Standup",
  "start": "2025-01-09T09:00:00",
  "end": "2025-01-09T09:30:00",
  "location": "Zoom"
}
```

### Pi2 HomeAPI (Port 8000) - External, Built Separately

Frontend expects these endpoints from Pi2:

| Endpoint | Method | Request | Response |
|----------|--------|---------|----------|
| `/api/lights` | GET | - | `{ lights: [{ id, name, state, brightness }, ...] }` |
| `/api/lights/{id}` | GET | - | `{ id, name, state, brightness }` |
| `/api/lights/{id}/state` | POST | `{ state: "on" \| "off" }` | `{ success: true, state }` |
| `/api/lights/{id}/brightness` | POST | `{ brightness: 0-100 }` | `{ success: true, brightness }` |
| `/api/temp` | GET | - | `{ temp: 72, unit: "F", timestamp }` |
| `/api/stats` | GET | - | `{ cpu_temp, cpu_usage, ram_usage, disk_usage }` |

**Light IDs:**
- `light_desk` - Desk
- `light_living` - Living Room  
- `light_door` - Front Door
- `light_tv` - TV

---

## Environment Variables

### Backend (.env)

```bash
# Server
HOST=0.0.0.0
PORT=8000

# AWS
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
S3_BUCKET_NAME=your-bucket-name

# Lambda Detection
LAMBDA_DETECTION_URL=https://xxx.lambda-url.us-east-1.on.aws/

# Google Calendar (Phase 7)
GOOGLE_CREDENTIALS_PATH=/path/to/credentials.json
GOOGLE_TOKEN_PATH=/path/to/token.json

# Detection Settings
DETECTION_CHECK_INTERVAL=15
DETECTION_COOLDOWN=120
RECORDING_DURATION=5
RECORDING_FPS=10
```

### Frontend (.env.local)

```bash
# Backend URLs
PI1_API_URL=http://localhost:8000
PI2_API_URL=http://pi2.tailnet:8000

# Direct camera stream (bypasses proxy for performance)
NEXT_PUBLIC_CAMERA_STREAM_URL=http://pi1.tailnet:8000/api/camera/stream
```

---

## Implementation Phases

### Phase 1: FastAPI Backend Migration (CURRENT)
- [ ] Set up backend project structure
- [ ] Create config.py with Pydantic Settings
- [ ] Migrate camera service (Picamera2 singleton)
- [ ] Migrate S3 service (upload + list videos)
- [ ] Migrate detection service (Lambda calls)
- [ ] Migrate pi_stats service
- [ ] Create camera router (MJPEG stream)
- [ ] Create alerts router
- [ ] Create stats router
- [ ] Implement background detection loop with FastAPI lifespan
- [ ] Add health check endpoint
- [ ] Test all endpoints

### Phase 2: Next.js Foundation
- [ ] Initialize Next.js with Tailwind
- [ ] Set up dark/light theme with next-themes
- [ ] Create Dock navigation component
- [ ] Create base layout with responsive structure
- [ ] Set up API proxy routes
- [ ] Configure environment variables

### Phase 3: Dashboard Widgets
- [ ] Create Widget base component
- [ ] Implement LightWidget with state/brightness control
- [ ] Implement TempWidget with polling
- [ ] Set up SWR hooks for data fetching
- [ ] Create WidgetGrid with horizontal scroll (desktop) / vertical (mobile)

### Phase 4: Drag & Drop + Persistence
- [ ] Integrate @dnd-kit/core
- [ ] Implement edit mode toggle
- [ ] Add drag handles to widgets
- [ ] Persist layout to localStorage

### Phase 5: Camera Page
- [ ] Build LiveFeed component (direct MJPEG)
- [ ] Create AlertList with thumbnails
- [ ] Add date range filters
- [ ] Implement AlertModal for video playback

### Phase 6: System Page
- [ ] Create PiStatCard component
- [ ] Implement StatBar with color coding
- [ ] Add Pi1 + Pi2 stats integration
- [ ] Set up auto-refresh polling

### Phase 7: Google Calendar
- [ ] Set up Google Cloud project
- [ ] Implement backend calendar endpoint
- [ ] Create CalendarWidget component

### Phase 8: Polish & Deploy
- [ ] Performance optimization
- [ ] Error boundaries and loading states
- [ ] Deployment scripts

---

## Existing Flask Code to Migrate

The following code is the current Flask implementation that needs to be migrated to FastAPI.

### app.py (Main Flask Application)

```python
from flask import Flask, Response, render_template, jsonify, request
from picamera2 import Picamera2
import cv2
from s3_uploader import S3Uploader
import time
import threading
from detection import detect_person_lambda
from pi_stats import get_pi_stats


app = Flask(__name__)
s3_uploader = S3Uploader()

pi_camera = Picamera2()
pi_camera.configure(pi_camera.create_video_configuration(main={"size": (640, 480)}))
pi_camera.start()

# Detection/upload state
last_check_time = 0
last_upload_time = 0
is_recording = False
person_present = False
recording_lock = threading.Lock()

CHECK_INTERVAL = 15          # Check less frequently when idle
UPLOAD_COOLDOWN = 120
ACTIVE_CHECK_INTERVAL = 15   # Check less frequently when active too

def record_and_upload():
    """Record 5 seconds and upload to S3"""
    global is_recording
    
    print("Recording 5-second clip...")
    frames = []
    fps = 10  # Reduced from 15 to lower CPU load
    duration = 5
    total_frames = fps * duration
    
    for i in range(total_frames):
        frame = pi_camera.capture_array()
        frames.append(frame)
        time.sleep(1/fps)
    
    print("Uploading video to S3...")
    
    if s3_uploader.upload_video(frames, fps):
        print("Video uploaded successfully!")
    else:
        print("Failed to upload video")
    
    with recording_lock:
        is_recording = False

def check_for_person():
    """Background thread that periodically checks for person"""
    global last_check_time, last_upload_time, is_recording, person_present
    
    while True:
        current_time = time.time()
        
        if person_present:
            check_interval = ACTIVE_CHECK_INTERVAL
        else:
            check_interval = CHECK_INTERVAL
        
        if current_time - last_check_time >= check_interval:
            last_check_time = current_time
            
            frame = pi_camera.capture_array()
            
            print(f"Checking for person... (interval: {check_interval}s)")
            person_detected = detect_person_lambda(frame)
            
            if person_detected:
                print("Person detected!")
                person_present = True
                
                if current_time - last_upload_time >= UPLOAD_COOLDOWN:
                    with recording_lock:
                        if not is_recording:
                            print("Triggering recording!")
                            is_recording = True
                            last_upload_time = current_time
                            
                            thread = threading.Thread(target=record_and_upload)
                            thread.daemon = True
                            thread.start()
                else:
                    time_left = int(UPLOAD_COOLDOWN - (current_time - last_upload_time))
                    print(f"Cooldown active. Next upload in {time_left}s")
            else:
                if person_present:
                    print("Person no longer detected")
                person_present = False
        
        time.sleep(1)

def generate_frames():
    """Stream video to browser"""
    while True:
        frame = pi_camera.capture_array()
        frame_bgr = cv2.cvtColor(frame, cv2.COLOR_RGB2BGR)
        
        ret, buffer = cv2.imencode('.jpg', frame_bgr)
        frame_bytes = buffer.tobytes()
        
        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')
        
        time.sleep(0.1)  # ~10fps instead of 30fps to reduce CPU load

@app.route("/")
def index():
    return render_template('index.html')

@app.route('/video_feed')
def video_feed():
    return Response(generate_frames(),
                    mimetype='multipart/x-mixed-replace; boundary=frame')

@app.route('/alerts')
def alerts():
    return render_template('alerts.html')

@app.route('/api/videos')
def api_videos():
    """API endpoint to list videos from S3 with optional date range filtering"""
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')
    
    videos = s3_uploader.list_videos(start_date, end_date)
    return jsonify({'videos': videos})


@app.route('/stats')
def stats():
    return render_template('stats.html')

@app.route('/api/stats')
def api_stats():
    return jsonify(get_pi_stats())

if __name__ == '__main__':
    detection_thread = threading.Thread(target=check_for_person)
    detection_thread.daemon = True
    detection_thread.start()
    
    app.run(host="0.0.0.0", port=8080, debug=False)
```

### detection.py (Lambda Person Detection)

```python
import cv2
import base64
import requests
from config import LAMBDA_URL

def detect_person_lambda(frame):
    """
    Send frame to Lambda for person detection
    
    Args:
        frame: numpy array (image frame)
        
    Returns:
        bool: True if person detected
    """
    try:
        # Encode frame as JPEG
        ret, buffer = cv2.imencode('.jpg', frame, [cv2.IMWRITE_JPEG_QUALITY, 80])
        if not ret:
            print("Failed to encode frame")
            return False
        
        # Convert to base64
        image_b64 = base64.b64encode(buffer).decode('utf-8')
        
        # Send to Lambda
        response = requests.post(
            LAMBDA_URL,
            json={'image': image_b64},
            timeout=30
        )
        
        if response.status_code == 200:
            result = response.json()
            person_detected = result.get('person_detected', False)
            if person_detected:
                print(f"Person detected! ({result.get('num_detections', 0)} detections)")
            return person_detected
        else:
            print(f"Lambda error: {response.status_code}")
            return False
            
    except requests.exceptions.Timeout:
        print("Lambda request timed out")
        return False
    except Exception as e:
        print(f"Detection error: {e}")
        return False
```

### s3_uploader.py (S3 Video Storage)

```python
import boto3
import cv2
import subprocess
from datetime import datetime
from config import REGION_NAME, BUCKET_NAME, ACCESS_KEY, SECRET_KEY

class S3Uploader:
    def __init__(self):
        self.s3 = boto3.client(
            's3',
            region_name=REGION_NAME,
            aws_access_key_id=ACCESS_KEY,
            aws_secret_access_key=SECRET_KEY
        )
        self.bucket_name = BUCKET_NAME
    
    def create_file_name(self, extension='jpg'):
        return datetime.now().strftime("%Y%m%d_%H%M%S") + f".{extension}"
    
    
    def upload_video(self, frames, fps=15):
        """
        Upload frames as browser-compatible MP4 video
        """
        if not frames:
            return False
        
        file_name = self.create_file_name('mp4')
        
        try:
            import os
            height, width = frames[0].shape[:2]
            
            # Step 1: Create temporary AVI with MJPG (always works on Pi)
            temp_avi = f'/tmp/temp_{file_name.replace(".mp4", ".avi")}'
            fourcc = cv2.VideoWriter_fourcc(*'MJPG')
            out = cv2.VideoWriter(temp_avi, fourcc, fps, (width, height))
            
            for frame in frames:
                # Convert from RGB/RGBA to BGR for OpenCV
                if len(frame.shape) == 3:
                    if frame.shape[2] == 4:  # RGBA/XRGB
                        frame = cv2.cvtColor(frame, cv2.COLOR_RGBA2BGR)
                    elif frame.shape[2] == 3:  # RGB
                        frame = cv2.cvtColor(frame, cv2.COLOR_RGB2BGR)
                out.write(frame)
            
            out.release()
            
            # Verify AVI was created
            avi_size = os.path.getsize(temp_avi)
            print(f"Created temp AVI: {avi_size} bytes, {len(frames)} frames")
            
            if avi_size == 0:
                print("ERROR: AVI file is empty - frame writing failed")
                os.remove(temp_avi)
                return False
            
            # Step 2: Convert to H.264 MP4 using ffmpeg
            temp_mp4 = f'/tmp/{file_name}'
            
            ffmpeg_cmd = [
                'ffmpeg',
                '-y',  # Overwrite output file
                '-i', temp_avi,  # Input file
                '-c:v', 'libx264',  # H.264 codec
                '-preset', 'ultrafast',  # Fast encoding
                '-crf', '23',  # Quality (lower = better, 23 is default)
                '-pix_fmt', 'yuv420p',  # Browser compatibility
                temp_mp4
            ]
            
            # Run ffmpeg conversion
            result = subprocess.run(
                ffmpeg_cmd,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE
            )
            
            if result.returncode != 0:
                print(f"FFmpeg conversion failed: {result.stderr.decode()}")
                if os.path.exists(temp_avi):
                    os.remove(temp_avi)
                return False
            
            # Step 3: Upload to S3
            with open(temp_mp4, 'rb') as video_file:
                self.s3.put_object(
                    Bucket=self.bucket_name,
                    Key=file_name,
                    Body=video_file,
                    ContentType='video/mp4'
                )
            
            # Clean up temp files
            os.remove(temp_avi)
            os.remove(temp_mp4)
            
            print(f"Uploaded video: {file_name}")
            return True
            
        except Exception as e:
            print(f"Error uploading video to S3: {e}")
            return False
    
    def list_videos(self, start_date=None, end_date=None):
        """
        List all videos from S3 bucket with optional date range filtering
        
        Args:
            start_date: Optional start date string (YYYY-MM-DD)
            end_date: Optional end date string (YYYY-MM-DD)
            
        Returns:
            List of video objects with url, filename, and timestamp
        """
        videos = []
        
        try:
            # List all objects in bucket
            response = self.s3.list_objects_v2(Bucket=self.bucket_name)
            
            if 'Contents' not in response:
                return videos
            
            for obj in response['Contents']:
                key = obj['Key']
                
                # Only include mp4 files
                if not key.endswith('.mp4'):
                    continue
                
                # Parse timestamp from filename (format: YYYYMMDD_HHMMSS.mp4)
                try:
                    timestamp_str = key.replace('.mp4', '')
                    timestamp = datetime.strptime(timestamp_str, "%Y%m%d_%H%M%S")
                except ValueError:
                    continue
                
                # Apply date range filter
                if start_date:
                    filter_start = datetime.strptime(start_date, "%Y-%m-%d").date()
                    if timestamp.date() < filter_start:
                        continue
                
                if end_date:
                    filter_end = datetime.strptime(end_date, "%Y-%m-%d").date()
                    if timestamp.date() > filter_end:
                        continue
                
                # Generate presigned URL for video playback
                url = self.s3.generate_presigned_url(
                    'get_object',
                    Params={'Bucket': self.bucket_name, 'Key': key},
                    ExpiresIn=3600  # URL valid for 1 hour
                )
                
                videos.append({
                    'filename': key,
                    'url': url,
                    'timestamp': timestamp.isoformat()
                })
            
            # Sort by timestamp (newest first)
            videos.sort(key=lambda x: x['timestamp'], reverse=True)
            
        except Exception as e:
            print(f"Error listing videos from S3: {e}")
        
        return videos
```

### pi_stats.py (System Statistics)

```python
from gpiozero import CPUTemperature
import psutil
import requests
from config import TEMP_API_URL

cpu = CPUTemperature()


def get_pi_stats():
    ram = psutil.virtual_memory()
    disk = psutil.disk_usage('/')
    cpu_usage = psutil.cpu_percent(interval=0.1)
    
    # NOTE: In FastAPI version, remove home_temp fetch
    # Temperature will be fetched by frontend from Pi2 directly
    
    return {
        'cpu_temp': int(round(cpu.temperature)),
        'cpu_usage': cpu_usage,
        'ram_usage': ram.percent,
        'disk_usage': disk.percent
    }
```

---

## Frontend Specifications

### Navigation (Dock)

macOS-style dock fixed at bottom of screen:

```
┌──────────────────────────────────────────────────────┐
│                    DASHBOARD CONTENT                 │
├──────────────────────────────────────────────────────┤
│     🏠          📹          📊          ⚙️           │
│    Home       Camera      System      Settings       │
└──────────────────────────────────────────────────────┘
```

- **Home** - Main dashboard with widgets
- **Camera** - Live feed + alert history
- **System** - Pi monitoring stats
- **Settings** - Theme toggle (dark/light), edit mode toggle

### Widget Specifications

#### Light Widget (×4)
```
┌─────────────────────────────┐
│  💡  Living Room            │  ← Name + Icon (glows when ON)
│                             │
│      ○ OFF    ● ON          │  ← Toggle switch
│                             │
│  ──────●────────────  75%   │  ← Brightness slider
└─────────────────────────────┘
```

- On load: GET `/api/lights/{id}` for current state + brightness
- Toggle: POST `/api/lights/{id}/state` with `{ state: "on" | "off" }`
- Slider: POST `/api/lights/{id}/brightness` with `{ brightness: 0-100 }`
- Debounce slider changes (300ms)
- Glow effect (CSS box-shadow) in warm amber when light is ON

#### Temperature Widget
```
┌─────────────────────────────┐
│  🌡️  Temperature            │
│                             │
│         72°F                │
│                             │
│    Updated: 2 min ago       │
└─────────────────────────────┘
```

- Poll `/api/temp` every 60 seconds
- Color indicator: blue (cold) → green (comfortable) → red (hot)

#### Calendar Widget
```
┌─────────────────────────────┐
│  📅  Today's Schedule       │
│                             │
│  9:00 AM   Team Standup     │
│  2:00 PM   Dentist Appt     │
│                             │
│       No more events        │
└─────────────────────────────┘
```

- Fetch on load, refresh every 15 minutes
- "No events today" empty state

### Layout Behavior

**Desktop:**
- Horizontal scrolling grid
- Widgets in rows that extend right

**Mobile:**
- Vertical scrolling
- Single/double column layout

**Edit Mode:**
- Toggle via Settings
- Drag-and-drop reordering with @dnd-kit
- Save persists to localStorage

### Design System

**Dark Mode (default):**
- Background: `#0a0a0a`
- Card/Widget: `#1e1e1e`
- Primary accent: `#3b82f6`
- Light ON glow: `#fbbf24` (amber)

**Light Mode:**
- Background: `#f5f5f5`
- Card/Widget: `#ffffff`

### Polling Intervals
- Lights: On-demand + 30s background
- Temperature: 60s
- System stats: 15-30s
- Calendar: 15 minutes
- Camera: Continuous stream
- Alerts: On page load + manual refresh

---

## Camera Page Specifications

```
┌────────────────────────────────────────────────────────┐
│                    LIVE FEED                           │
│              (MJPEG Stream - direct to FastAPI)        │
│                                                        │
├────────────────────────────────────────────────────────┤
│  ALERTS                          🔍 Search  📅 Filter  │
├────────────────────────────────────────────────────────┤
│  ┌──────┐  Jan 9, 2025 - 3:42 PM                      │
│  │ thumb│  Motion detected at front door              │
│  └──────┘  [View Video]                               │
├────────────────────────────────────────────────────────┤
│  ┌──────┐  Jan 9, 2025 - 11:15 AM                     │
│  │ thumb│  Person detected                            │
│  └──────┘  [View Video]                               │
└────────────────────────────────────────────────────────┘
```

- Live MJPEG via `<img src={CAMERA_STREAM_URL}>` (direct to FastAPI, not proxied)
- Date range picker for filtering alerts
- Click alert → modal with video playback
- Pagination or infinite scroll

---

## System Page Specifications

```
┌─────────────────────────────────────────────────────────┐
│                     SYSTEM HEALTH                       │
├──────────────────────────┬──────────────────────────────┤
│         PI 1             │            PI 2              │
│      (Camera Server)     │         (HomeAPI)            │
├──────────────────────────┼──────────────────────────────┤
│  CPU:    ████████░░ 78%  │  CPU:    ███░░░░░░░ 32%     │
│  RAM:    █████░░░░░ 52%  │  RAM:    ████░░░░░░ 41%     │
│  Disk:   ███████░░░ 68%  │  Disk:   ██░░░░░░░░ 23%     │
│  Temp:   45°C            │  Temp:   38°C               │
└──────────────────────────┴──────────────────────────────┘
```

- Side-by-side comparison
- Color coding: green (healthy) → yellow (warning) → red (critical)
- Auto-refresh every 15-30s

---

## Key Implementation Notes

### MJPEG Streaming
The camera stream goes **directly** from browser to FastAPI (`NEXT_PUBLIC_CAMERA_STREAM_URL`), NOT through Next.js proxy. This avoids latency.

### Background Detection Loop
Use FastAPI's `lifespan` context manager with `asyncio.create_task()`. For blocking calls (camera capture, Lambda HTTP), use `asyncio.to_thread()`.

```python
from contextlib import asynccontextmanager
import asyncio

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    task = asyncio.create_task(detection_loop.start())
    yield
    # Shutdown
    detection_loop.stop()
    task.cancel()

app = FastAPI(lifespan=lifespan)
```

### Config with Pydantic Settings
```python
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    host: str = "0.0.0.0"
    port: int = 8000
    aws_region: str
    aws_access_key_id: str
    aws_secret_access_key: str
    s3_bucket_name: str
    lambda_detection_url: str
    detection_check_interval: int = 15
    detection_cooldown: int = 120
    recording_duration: int = 5
    recording_fps: int = 10

    class Config:
        env_file = ".env"

settings = Settings()
```

### Camera Singleton Pattern
```python
class CameraService:
    _instance = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._camera = None
        return cls._instance
    
    def start(self):
        if self._camera is None:
            from picamera2 import Picamera2
            self._camera = Picamera2()
            self._camera.configure(
                self._camera.create_video_configuration(main={"size": (640, 480)})
            )
            self._camera.start()
    
    def capture_frame(self):
        return self._camera.capture_array()

camera_service = CameraService()
```

---

## Commands

### Start Backend (Development)
```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

### Start Frontend (Development)
```bash
cd frontend
npm install
npm run dev
```

### Production (systemd services to be created)
```bash
# Backend
./scripts/start-backend.sh

# Frontend
./scripts/start-frontend.sh
```

---

## Current Task

**Phase 1: FastAPI Backend Migration**

Start by setting up the backend project structure and migrating the Flask application to FastAPI. The existing Flask code is provided above in the "Existing Flask Code to Migrate" section.

Begin with:
1. Create the backend folder structure
2. Set up requirements.txt
3. Create config.py with Pydantic Settings
4. Migrate services (camera, s3, detection, pi_stats)
5. Create routers (camera, alerts, stats)
6. Implement the detection loop with FastAPI lifespan
7. Add health check endpoint
