"use client";

/**
 * Live Feed component
 * Displays MJPEG stream directly from FastAPI backend
 */

import { useState } from "react";
import { Video, VideoOff, Maximize2, Minimize2 } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { CAMERA_STREAM_URL } from "@/lib/utils/constants";

interface LiveFeedProps {
  className?: string;
}

export function LiveFeed({ className }: LiveFeedProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  return (
    <div
      className={cn(
        "bg-card border border-border rounded-2xl overflow-hidden",
        isFullscreen && "fixed inset-4 z-50",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <div className={cn(
            "p-2 rounded-full",
            hasError ? "bg-red-500/10" : "bg-green-500/10"
          )}>
            {hasError ? (
              <VideoOff className="w-4 h-4 text-red-500" />
            ) : (
              <Video className="w-4 h-4 text-green-500" />
            )}
          </div>
          <div>
            <h2 className="font-semibold text-foreground">Live Feed</h2>
            <p className="text-xs text-foreground/60">
              {hasError ? "Camera offline" : isLoading ? "Connecting..." : "Live"}
            </p>
          </div>
        </div>
        <button
          onClick={toggleFullscreen}
          className="p-2 rounded-lg hover:bg-background transition-colors"
          aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
        >
          {isFullscreen ? (
            <Minimize2 className="w-5 h-5 text-foreground/60" />
          ) : (
            <Maximize2 className="w-5 h-5 text-foreground/60" />
          )}
        </button>
      </div>

      {/* Video container */}
      <div className={cn(
        "relative bg-black",
        isFullscreen ? "h-[calc(100%-60px)]" : "aspect-video"
      )}>
        {/* Loading state */}
        {isLoading && !hasError && (
          <div className="absolute inset-0 flex items-center justify-center bg-black">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
              <p className="text-white/60 text-sm">Connecting to camera...</p>
            </div>
          </div>
        )}

        {/* Error state */}
        {hasError && (
          <div className="absolute inset-0 flex items-center justify-center bg-black">
            <div className="text-center">
              <VideoOff className="w-16 h-16 text-red-500/50 mx-auto mb-4" />
              <p className="text-white/80 font-medium mb-2">Camera Unavailable</p>
              <p className="text-white/50 text-sm mb-4">Unable to connect to the camera stream</p>
              <button
                onClick={() => {
                  setHasError(false);
                  setIsLoading(true);
                }}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm"
              >
                Retry Connection
              </button>
            </div>
          </div>
        )}

        {/* MJPEG Stream - direct connection to FastAPI */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={CAMERA_STREAM_URL}
          alt="Live camera feed"
          className={cn(
            "w-full h-full object-contain",
            (isLoading || hasError) && "invisible"
          )}
          onLoad={handleLoad}
          onError={handleError}
        />

        {/* Live indicator */}
        {!isLoading && !hasError && (
          <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 bg-black/50 backdrop-blur-sm rounded-full">
            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            <span className="text-white text-xs font-medium">LIVE</span>
          </div>
        )}
      </div>

      {/* Fullscreen backdrop */}
      {isFullscreen && (
        <div
          className="fixed inset-0 bg-black/80 -z-10"
          onClick={toggleFullscreen}
        />
      )}
    </div>
  );
}
