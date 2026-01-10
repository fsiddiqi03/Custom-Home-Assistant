"use client";

/**
 * Temperature Widget component
 * Displays current temperature with color indicator
 */

import { Thermometer } from "lucide-react";
import { Widget } from "./Widget";
import { cn } from "@/lib/utils/cn";
import type { Temperature } from "@/types";

interface TempWidgetProps {
  temperature: Temperature | null;
  isLoading?: boolean;
  error?: string;
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

function formatTimeAgo(timestamp: string): string {
  const now = new Date();
  const then = new Date(timestamp);
  const diffMs = now.getTime() - then.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return "Just now";
  if (diffMins === 1) return "1 min ago";
  if (diffMins < 60) return `${diffMins} mins ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours === 1) return "1 hour ago";
  return `${diffHours} hours ago`;
}

export function TempWidget({ temperature, isLoading, error }: TempWidgetProps) {
  if (error) {
    return (
      <Widget
        title="Temperature"
        icon={<Thermometer className="w-4 h-4" />}
        className="min-w-[180px]"
      >
        <div className="text-center py-4">
          <p className="text-red-500 text-sm">{error}</p>
        </div>
      </Widget>
    );
  }

  return (
    <Widget isLoading={isLoading} className="min-w-[180px]">
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
              "w-4 h-4",
              temperature
                ? getTemperatureColor(temperature.temp, temperature.unit)
                : "text-foreground/60"
            )}
          />
        </div>
        <span className="text-sm font-medium text-foreground/80">Temperature</span>
      </div>

      {/* Temperature display */}
      <div className="text-center py-2">
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
            <p className="text-xs text-foreground/50 mt-2">
              Updated: {formatTimeAgo(temperature.timestamp)}
            </p>
          </>
        ) : (
          <p className="text-foreground/50">No data</p>
        )}
      </div>
    </Widget>
  );
}
