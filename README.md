# 🏠 Custom Home Assistant

A modern, self-hosted home automation dashboard built from scratch with **FastAPI**, **Next.js**, and **AWS cloud services**. Features AI-powered security monitoring with YOLO object detection, smart light control, environmental sensors, and a beautiful responsive UI optimized for wall-mounted Raspberry Pi displays.

![Architecture](https://img.shields.io/badge/Architecture-Microservices-blue)
![Backend](https://img.shields.io/badge/Backend-FastAPI-009688)
![Frontend](https://img.shields.io/badge/Frontend-Next.js%2016-black)
![AI](https://img.shields.io/badge/AI-YOLOv8-purple)
![Cloud](https://img.shields.io/badge/Cloud-AWS-orange)

---

## ✨ Features

### 🎥 Security Camera System
- **Live MJPEG streaming** from Raspberry Pi Camera 3
- **AI-powered person detection** using YOLOv8 model
- **Automatic video recording** when motion is detected
- **Cloud storage** with searchable alert history
- **Email notifications** via event-driven architecture

### 💡 Smart Light Control
- **Philips Hue** integration
- **Govee** device support
- Individual light on/off toggle
- Brightness slider control (0-100%)
- Real-time state synchronization

### 🌡️ Environmental Monitoring
- **Custom thermometer** built with Raspberry Pi
- Real-time room temperature readings
- FastAPI endpoint for temperature data

### 📅 Calendar Integration
- Google Calendar sync
- Today's schedule at a glance
- Event notifications

### 📊 System Health Monitoring
- CPU temperature & usage
- RAM utilization
- Disk space tracking
- Multi-Pi monitoring dashboard

### 🎨 Modern UI/UX
- **Drag-and-drop** widget layout with persistence
- **Dark/Light theme** support
- **macOS-style dock** navigation
- Responsive design for mobile & wall-mounted displays
- Tailscale VPN for secure remote access

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           NETWORK (Tailscale VPN)                           │
└─────────────────────────────────────────────────────────────────────────────┘
                    │                                       │
                    ▼                                       ▼
┌───────────────────────────────────────┐    ┌────────────────────────────────┐
│              PI1 (Main Server)        │    │        PI2 (HomeAPI)           │
├───────────────────────────────────────┤    ├────────────────────────────────┤
│                                       │    │                                │
│  ┌─────────────────────────────────┐  │    │  FastAPI Server:               │
│  │   Next.js Frontend (:3000)      │  │    │  • GET  /api/lights            │
│  │   • Dashboard UI                │  │    │  • POST /api/lights/:id/state  │
│  │   • API Proxy Routes            │  │    │  • POST /api/lights/:id/       │
│  │   • Drag & Drop Widgets         │  │    │        brightness              │
│  └─────────────┬───────────────────┘  │    │  • GET  /api/temp  ← Custom    │
│                │                      │    │        Thermometer Sensor      │
│                ▼                      │    │  • GET  /api/stats             │
│  ┌─────────────────────────────────┐  │    │                                │
│  │   FastAPI Backend (:8000)       │  │    │  Hardware:                     │
│  │                                 │  │    │  • Temperature sensor          │
│  │   • GET  /api/camera/stream     │  │    │  • Hue Bridge connection       │
│  │   • GET  /api/alerts            │  │    │  • Govee API integration       │
│  │   • GET  /api/stats             │  │    │                                │
│  │   • GET  /api/calendar/today    │  │    └────────────────────────────────┘
│  │                                 │  │
│  │   Background Tasks:             │  │
│  │   • Person detection loop       │  │
│  │   • Recording & S3 upload       │  │
│  │   • Email notifications         │  │
│  └─────────────────────────────────┘  │
│                                       │
│  ┌─────────────────────────────────┐  │
│  │   Hardware                      │  │
│  │   • Raspberry Pi Camera 3       │  │
│  └─────────────────────────────────┘  │
│                │                      │
└────────────────┼──────────────────────┘
                 │
                 ▼
┌────────────────────────────────────────────────────────────────────────────┐
│                              AWS CLOUD                                     │
├────────────────────────────────────────────────────────────────────────────┤
│                                                                            │
│  ┌──────────────────┐    ┌──────────────────┐    ┌──────────────────────┐  │
│  │   API Gateway    │───▶│     Lambda       │    │        ECR           │  │
│  │                  │    │                  │    │                      │  │
│  │  REST endpoint   │    │  YOLO Detection  │◀───│  Docker Container    │  │
│  │  for detection   │    │  Container       │    │  with YOLOv8 model   │  │
│  └──────────────────┘    └────────┬─────────┘    └──────────────────────┘  │
│                                   │                                        │
│                                   ▼                                        │
│  ┌──────────────────┐    ┌──────────────────┐    ┌──────────────────────┐  │
│  │       S3         │    │   EventBridge    │───▶│        SES           │  │
│  │                  │    │                  │    │                      │  │
│  │  Video Storage   │    │  Event-driven    │    │  Email Notifications │  │
│  │  Alert clips     │    │  triggers        │    │  on person detection │  │
│  └──────────────────┘    └──────────────────┘    └──────────────────────┘  │
│                                                                            │
└────────────────────────────────────────────────────────────────────────────┘
```

---

## 🤖 AI Detection Pipeline

The security system uses a **YOLO (You Only Look Once)** object detection model for real-time person detection:

### How It Works

1. **Frame Capture**: Pi Camera captures frames every 15 seconds
2. **Base64 Encoding**: Frame is JPEG-encoded and base64-converted
3. **API Gateway**: Request sent to AWS API Gateway endpoint
4. **Lambda Invocation**: API Gateway triggers Lambda function
5. **Container Execution**: Lambda pulls Docker image from **AWS ECR** containing YOLOv8 model
6. **Inference**: YOLO model processes frame and detects persons
7. **Response**: Detection results returned to Pi
8. **Recording**: If person detected, 5-second clip is recorded
9. **S3 Upload**: Video converted to H.264 MP4 and uploaded to **AWS S3**
10. **Notification**: **AWS SES** sends email alert via event-driven architecture

### Detection Configuration

| Setting | Default | Description |
|---------|---------|-------------|
| `DETECTION_CHECK_INTERVAL` | 15s | Time between detection checks |
| `DETECTION_COOLDOWN` | 120s | Minimum time between recordings |
| `RECORDING_DURATION` | 5s | Length of recorded clips |
| `RECORDING_FPS` | 10 | Frames per second for recordings |

---

## 🌡️ Custom Thermometer

A dedicated Raspberry Pi (Pi2) runs a custom-built temperature monitoring system:

- **Hardware**: Temperature sensor connected to Raspberry Pi GPIO
- **Software**: FastAPI server exposing `/api/temp` endpoint
- **Response Format**:
```json
{
  "temp": 72,
  "unit": "F",
  "timestamp": "2025-01-16T10:30:00"
}
```

The frontend polls this endpoint every 60 seconds and displays the temperature with color-coded indicators:
- 🔵 **Blue**: Cold (< 65°F)
- 🟢 **Green**: Comfortable (65-75°F)
- 🔴 **Red**: Hot (> 75°F)

---

## 📁 Project Structure

```
home-assistant/
├── backend/                          # FastAPI Backend (Pi1)
│   ├── app/
│   │   ├── main.py                   # App entry + lifespan management
│   │   ├── config.py                 # Pydantic Settings
│   │   ├── routers/
│   │   │   ├── camera.py             # MJPEG streaming
│   │   │   ├── alerts.py             # S3 video listing
│   │   │   ├── stats.py              # System metrics
│   │   │   └── calendar.py           # Google Calendar
│   │   ├── services/
│   │   │   ├── camera.py             # Picamera2 singleton
│   │   │   ├── detection.py          # Lambda API calls
│   │   │   ├── recorder.py           # Video recording
│   │   │   ├── s3.py                 # S3 upload/list
│   │   │   └── pi_stats.py           # CPU/RAM/Disk
│   │   ├── tasks/
│   │   │   └── detection_loop.py     # Background detection
│   │   └── models/
│   │       └── schemas.py            # Pydantic models
│   └── requirements.txt
│
├── frontend/                         # Next.js Frontend
│   ├── app/
│   │   ├── page.tsx                  # Home dashboard
│   │   ├── camera/page.tsx           # Live feed + alerts
│   │   ├── system/page.tsx           # Pi monitoring
│   │   └── api/                      # Proxy routes
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Dock.tsx              # macOS-style navigation
│   │   │   ├── DraggableWidgetGrid.tsx
│   │   │   └── ThemeToggle.tsx
│   │   ├── widgets/
│   │   │   ├── LightWidget.tsx
│   │   │   ├── TempWidget.tsx
│   │   │   └── CalendarWidget.tsx
│   │   └── camera/
│   │       ├── LiveFeed.tsx
│   │       ├── AlertList.tsx
│   │       └── AlertModal.tsx
│   └── lib/
│       └── hooks/                    # SWR data fetching
│
└── CLAUDE.md                         # Development context
```

---

## 🛠️ Tech Stack

### Backend
| Technology | Purpose |
|------------|---------|
| **FastAPI** | High-performance async API framework |
| **Uvicorn** | ASGI server |
| **Picamera2** | Raspberry Pi camera interface |
| **OpenCV** | Image processing & video encoding |
| **boto3** | AWS SDK (S3, presigned URLs) |
| **psutil** | System metrics |
| **gpiozero** | GPIO & CPU temperature |
| **Pydantic** | Data validation & settings |

### Frontend
| Technology | Purpose |
|------------|---------|
| **Next.js 16** | React framework with App Router |
| **React 19** | UI library |
| **Tailwind CSS 4** | Utility-first styling |
| **SWR** | Data fetching & caching |
| **@dnd-kit** | Drag-and-drop functionality |
| **next-themes** | Dark/light mode |
| **Lucide React** | Icon library |

### AWS Cloud Services
| Service | Purpose |
|---------|---------|
| **ECR** | Docker container registry for YOLO model |
| **Lambda** | Serverless compute for detection inference |
| **API Gateway** | REST API endpoint for Lambda |
| **S3** | Video storage with presigned URLs |
| **SES** | Email notifications |
| **EventBridge** | Event-driven notification triggers |

---

## 🔐 Security

- **Tailscale VPN**: Secure mesh network for remote access
- **No port forwarding**: All traffic stays within VPN
- **Presigned URLs**: S3 videos accessed via time-limited URLs
- **CORS configured**: API only accepts requests from known origins


