"use client";

/**
 * Alert List component
 * Displays grid of security alerts with thumbnails
 */

import { Play, Clock, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import type { Alert } from "@/types";

interface AlertListProps {
  alerts: Alert[];
  isLoading: boolean;
  error?: string;
  onSelectAlert: (alert: Alert) => void;
}

function formatTimestamp(timestamp: string): { date: string; time: string } {
  const date = new Date(timestamp);
  return {
    date: date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }),
    time: date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }),
  };
}

function getRelativeTime(timestamp: string): string {
  const now = new Date();
  const then = new Date(timestamp);
  const diffMs = now.getTime() - then.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatTimestamp(timestamp).date;
}

export function AlertList({
  alerts,
  isLoading,
  error,
  onSelectAlert,
}: AlertListProps) {
  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6 text-center">
        <AlertTriangle className="w-12 h-12 text-red-500/50 mx-auto mb-3" />
        <p className="text-red-500 font-medium">Failed to load alerts</p>
        <p className="text-red-500/70 text-sm mt-1">{error}</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="bg-card border border-border rounded-xl overflow-hidden animate-pulse"
          >
            <div className="aspect-video bg-foreground/10" />
            <div className="p-4 space-y-2">
              <div className="h-4 bg-foreground/10 rounded w-3/4" />
              <div className="h-3 bg-foreground/10 rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (alerts.length === 0) {
    return (
      <div className="bg-card border border-border rounded-2xl p-12 text-center">
        <div className="w-16 h-16 bg-foreground/5 rounded-full flex items-center justify-center mx-auto mb-4">
          <Play className="w-8 h-8 text-foreground/30" />
        </div>
        <p className="text-foreground/80 font-medium">No alerts found</p>
        <p className="text-foreground/50 text-sm mt-1">
          Motion detection alerts will appear here
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {alerts.map((alert) => (
        <AlertCard
          key={alert.filename}
          alert={alert}
          onClick={() => onSelectAlert(alert)}
        />
      ))}
    </div>
  );
}

interface AlertCardProps {
  alert: Alert;
  onClick: () => void;
}

function AlertCard({ alert, onClick }: AlertCardProps) {
  const { date, time } = formatTimestamp(alert.timestamp);
  const relativeTime = getRelativeTime(alert.timestamp);

  return (
    <button
      onClick={onClick}
      className={cn(
        "bg-card border border-border rounded-xl overflow-hidden text-left",
        "transition-all hover:border-primary/50 hover:shadow-lg",
        "focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 focus:ring-offset-background"
      )}
    >
      {/* Thumbnail / Video preview */}
      <div className="relative aspect-video bg-black group">
        {/* Placeholder - in production would show first frame of video */}
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-foreground/5 to-foreground/10">
          <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm group-hover:bg-primary/20 transition-colors">
            <Play className="w-5 h-5 text-white ml-0.5" />
          </div>
        </div>

        {/* Duration badge */}
        <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/70 backdrop-blur-sm rounded text-xs text-white font-medium">
          0:05
        </div>

        {/* Time badge */}
        <div className="absolute top-2 left-2 px-2 py-1 bg-black/70 backdrop-blur-sm rounded text-xs text-white">
          {relativeTime}
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="font-medium text-foreground text-sm">
              Person Detected
            </p>
            <div className="flex items-center gap-1 mt-1 text-foreground/50">
              <Clock className="w-3 h-3" />
              <span className="text-xs">
                {date} at {time}
              </span>
            </div>
          </div>
        </div>
      </div>
    </button>
  );
}
