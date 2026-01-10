# Home Dashboard Backend

FastAPI backend for the Home Dashboard project. Provides camera streaming, person detection with AI, video storage, and system monitoring.

## Features

- **MJPEG Camera Streaming**: Real-time video stream from Raspberry Pi Camera
- **AI Person Detection**: Lambda-based YOLO person detection
- **Video Recording**: Automatic 5-second clip recording when person detected
- **S3 Storage**: Browser-compatible MP4 video uploads to AWS S3
- **System Monitoring**: CPU, RAM, and disk usage statistics
- **Alert History**: Searchable video alerts with presigned URLs
- **Calendar Integration**: Google Calendar (Phase 7 - placeholder)

## Architecture

```
FastAPI Application
├── Camera Service (Picamera2 singleton)
├── Detection Loop (Background task)
├── S3 Service (Video upload/listing)
├── Detection Service (Lambda calls)
├── Pi Stats Service (System metrics)
└── Routers (API endpoints)
```

## API Endpoints

### Camera
- `GET /api/camera/stream` - MJPEG video stream

### Alerts
- `GET /api/alerts?start_date=YYYY-MM-DD&end_date=YYYY-MM-DD` - List alerts from S3

### Stats
- `GET /api/stats` - Pi1 system statistics

### Calendar
- `GET /api/calendar/today` - Today's events (Phase 7)

### Health
- `GET /health` - Health check with uptime
- `GET /` - API information

## Project Structure

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py                   # FastAPI app + lifespan
│   ├── config.py                 # Pydantic Settings
│   ├── routers/
│   │   ├── camera.py             # Camera streaming
│   │   ├── alerts.py             # Alert listing
│   │   ├── stats.py              # System stats
│   │   └── calendar.py           # Calendar (Phase 7)
│   ├── services/
│   │   ├── camera.py             # Picamera2 singleton
│   │   ├── detection.py          # Lambda detection
│   │   ├── recorder.py           # Video recording
│   │   ├── s3.py                 # S3 upload/list
│   │   └── pi_stats.py           # System stats
│   ├── tasks/
│   │   └── detection_loop.py     # Background detection
│   └── models/
│       └── schemas.py            # Pydantic models
├── .env.example
├── requirements.txt
└── README.md
```

## Setup

### Prerequisites

- Python 3.9+
- Raspberry Pi with Camera Module
- AWS Account (S3 bucket + Lambda function)
- ffmpeg installed (`sudo apt-get install ffmpeg`)

### Installation

1. Clone the repository:
```bash
cd backend
```

2. Create virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Configure environment:
```bash
cp .env.example .env
# Edit .env with your AWS credentials and Lambda URL
```

### Configuration

Edit `.env` file with your settings:

```bash
# Server
HOST=0.0.0.0
PORT=8000

# AWS
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
S3_BUCKET_NAME=your-bucket-name

# Lambda
LAMBDA_DETECTION_URL=https://xxx.lambda-url.us-east-1.on.aws/

# Detection Settings
DETECTION_CHECK_INTERVAL=15      # Check every 15s when idle
DETECTION_COOLDOWN=120           # 2min cooldown between uploads
RECORDING_DURATION=5             # 5-second clips
RECORDING_FPS=10                 # 10fps recording
```

## Running the Server

### Development Mode

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

### Production Mode

```bash
python -m app.main
```

### Using systemd (Production)

Create `/etc/systemd/system/home-dashboard-backend.service`:

```ini
[Unit]
Description=Home Dashboard Backend
After=network.target

[Service]
Type=simple
User=pi
WorkingDirectory=/home/pi/home-dashboard/backend
Environment="PATH=/home/pi/home-dashboard/backend/venv/bin"
ExecStart=/home/pi/home-dashboard/backend/venv/bin/python -m app.main
Restart=always

[Install]
WantedBy=multi-user.target
```

Enable and start:
```bash
sudo systemctl enable home-dashboard-backend
sudo systemctl start home-dashboard-backend
sudo systemctl status home-dashboard-backend
```

## API Documentation

Once the server is running, visit:

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## Background Tasks

### Detection Loop

The detection loop runs continuously in the background:

1. Captures frame every 15 seconds (when idle)
2. Sends frame to Lambda for person detection
3. If person detected:
   - Switches to faster checking (15s interval)
   - Records 5-second clip if cooldown expired
   - Uploads MP4 to S3
   - Enforces 2-minute cooldown between uploads

### Camera Singleton

The camera service uses a singleton pattern to ensure only one Picamera2 instance exists. It provides:

- Frame capture for detection
- MJPEG stream generation for live feed
- Proper startup/shutdown handling

## Development

### Adding New Endpoints

1. Create router in `app/routers/`
2. Add business logic to `app/services/`
3. Define schemas in `app/models/schemas.py`
4. Include router in `app/main.py`

### Testing Lambda Detection

```python
from app.services.camera import camera_service
from app.services.detection import detect_person_lambda

camera_service.start()
frame = camera_service.capture_frame()
result = detect_person_lambda(frame)
print(f"Person detected: {result}")
```

## Troubleshooting

### Camera Issues

```bash
# Check if camera is detected
libcamera-hello --list-cameras

# Test camera capture
libcamera-jpeg -o test.jpg
```

### ffmpeg Issues

```bash
# Install ffmpeg
sudo apt-get update
sudo apt-get install ffmpeg

# Verify installation
ffmpeg -version
```

### Permission Issues

```bash
# Add user to video group
sudo usermod -a -G video $USER
```

## Next Steps

Phase 1 (Backend) is now complete! The next phases are:

- **Phase 2**: Next.js frontend foundation
- **Phase 3**: Dashboard widgets
- **Phase 4**: Drag & drop layout
- **Phase 5**: Camera page
- **Phase 6**: System monitoring page
- **Phase 7**: Google Calendar integration
- **Phase 8**: Polish & deployment

## License

MIT
