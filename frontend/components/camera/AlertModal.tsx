"use client";

/**
 * Alert Modal component
 * Full-screen modal for video playback
 */

import { useEffect, useRef } from "react";
import { X, Download, Clock, Calendar } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import type { Alert } from "@/types";

interface AlertModalProps {
  alert: Alert | null;
  onClose: () => void;
}

function formatTimestamp(timestamp: string): { date: string; time: string } {
  const date = new Date(timestamp);
  return {
    date: date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    }),
    time: date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    }),
  };
}

export function AlertModal({ alert, onClose }: AlertModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  // Close on escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (alert) {
      document.addEventListener("keydown", handleKeyDown);
      // Prevent body scroll
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [alert, onClose]);

  // Auto-play video when modal opens
  useEffect(() => {
    if (alert && videoRef.current) {
      videoRef.current.play().catch(() => {
        // Autoplay may be blocked by browser
      });
    }
  }, [alert]);

  if (!alert) return null;

  const { date, time } = formatTimestamp(alert.timestamp);

  const handleDownload = () => {
    // Open video URL in new tab for download
    window.open(alert.url, "_blank");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/90 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal content */}
      <div className="relative z-10 w-full max-w-4xl mx-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="text-white">
            <h2 className="text-xl font-semibold">Motion Alert</h2>
            <div className="flex items-center gap-4 mt-1 text-white/60 text-sm">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                <span>{date}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                <span>{time}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-white text-sm"
            >
              <Download className="w-4 h-4" />
              Download
            </button>
            <button
              onClick={onClose}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-white"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Video player */}
        <div className="relative bg-black rounded-xl overflow-hidden shadow-2xl">
          <video
            ref={videoRef}
            src={alert.url}
            controls
            className="w-full aspect-video"
            playsInline
          >
            Your browser does not support the video tag.
          </video>
        </div>

        {/* Footer info */}
        <div className="mt-4 flex items-center justify-between text-white/50 text-sm">
          <span>Filename: {alert.filename}</span>
          <span>Duration: 5 seconds</span>
        </div>
      </div>
    </div>
  );
}
