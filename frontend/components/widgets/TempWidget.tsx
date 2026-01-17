"use client";

/**
 * Temperature Widget component
 * Displays current temperature with color indicator
 */

import { useState, useEffect } from "react";
import { Thermometer } from "lucide-react";
import { Widget } from "./Widget";
import { cn } from "@/lib/utils/cn";
import type { Temperature } from "@/types";

interface TempWidgetProps {
  temperature: Temperature | null;
  isLoading?: boolean;
  error?: string;
}

function getRelativeTime(timestamp: string): string {
  const now = Date.now();
  const then = new Date(timestamp).getTime();
  const diffInSeconds = Math.floor((now - then) / 1000);

  if (diffInSeconds < 0) return "just now";
  if (diffInSeconds === 0) return "just now";
  if (diffInSeconds === 1) return "1 second ago";
  if (diffInSeconds < 60) return `${diffInSeconds} seconds ago`;
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes === 1) return "1 minute ago";
  if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours === 1) return "1 hour ago";
  return `${diffInHours} hours ago`;
}

function getTemperatureColor(temp: number, unit: "F" | "C"): string {
  // Convert to Fahrenheit for consistent thresholds
  const tempF = unit === "C" ? (temp * 9) / 5 + 32 : temp;

  if (tempF < 60) return "text-blue-500";
  if (tempF < 75) return "text-green-500";
  return "text-red-500";
}

function getTemperatureBg(temp: number, unit: "F" | "C"): string {
  const tempF = unit === "C" ? (temp * 9) / 5 + 32 : temp;

  if (tempF < 60) return "bg-blue-500/10";
  if (tempF < 75) return "bg-green-500/10";
  return "bg-red-500/10";
}

export function TempWidget({ temperature, isLoading, error }: TempWidgetProps) {
  const [relativeTime, setRelativeTime] = useState<string>("");

  // Update relative time every second
  useEffect(() => {
    if (!temperature?.timestamp) return;

    // Initial calculation
    setRelativeTime(getRelativeTime(temperature.timestamp));

    // Update every second
    const interval = setInterval(() => {
      setRelativeTime(getRelativeTime(temperature.timestamp));
    }, 1000);

    return () => clearInterval(interval);
  }, [temperature?.timestamp]);

  if (error) {
    return (
      <Widget
        title="Temperature"
        icon={<Thermometer className="w-4 h-4" />}
        className="min-w-[200px] min-h-[180px]"
      >
        <div className="text-center py-4">
          <p className="text-red-500 text-sm">{error}</p>
        </div>
      </Widget>
    );
  }

  return (
    <Widget isLoading={isLoading} className="min-w-[200px] min-h-[180px] flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <div
          className={cn(
            "p-2 rounded-full",
            temperature ? getTemperatureBg(temperature.temp, temperature.unit) : "bg-foreground/10"
          )}
        >
          <Thermometer
            className={cn(
              "w-5 h-5",
              temperature
                ? getTemperatureColor(temperature.temp, temperature.unit)
                : "text-foreground/60"
            )}
          />
        </div>
        <span className="font-medium text-foreground">Temperature</span>
      </div>

      {/* Temperature display - flex-grow to fill available space */}
      <div className="flex-grow flex flex-col justify-center text-center">
        {temperature ? (
          <>
            <p
              className={cn(
                "text-4xl font-bold",
                getTemperatureColor(temperature.temp, temperature.unit)
              )}
            >
              {temperature.temp}°{temperature.unit}
            </p>
            <p className="text-xs text-foreground/50 mt-3">
              Updated {relativeTime || "just now"}
            </p>
          </>
        ) : (
          <p className="text-foreground/50">No data</p>
        )}
      </div>
    </Widget>
  );
}
