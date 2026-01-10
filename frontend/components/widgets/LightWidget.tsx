"use client";

/**
 * Light Widget component
 * Controls individual light with on/off toggle and brightness slider
 */

import { useState, useCallback } from "react";
import { Lightbulb } from "lucide-react";
import { Widget } from "./Widget";
import { Toggle } from "@/components/ui/Toggle";
import { Slider } from "@/components/ui/Slider";
import { cn } from "@/lib/utils/cn";
import type { Light } from "@/types";

interface LightWidgetProps {
  light: Light;
  onToggle: (id: string, state: "on" | "off") => Promise<void>;
  onBrightness: (id: string, brightness: number) => Promise<void>;
  isLoading?: boolean;
}

export function LightWidget({
  light,
  onToggle,
  onBrightness,
  isLoading = false,
}: LightWidgetProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [localBrightness, setLocalBrightness] = useState(light.brightness);
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null);

  const isOn = light.state === "on";

  const handleToggle = useCallback(async () => {
    setIsUpdating(true);
    try {
      await onToggle(light.id, isOn ? "off" : "on");
    } finally {
      setIsUpdating(false);
    }
  }, [light.id, isOn, onToggle]);

  const handleBrightnessChange = useCallback(
    (value: number) => {
      setLocalBrightness(value);

      // Clear existing debounce timer
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }

      // Debounce the API call
      const timer = setTimeout(async () => {
        setIsUpdating(true);
        try {
          await onBrightness(light.id, value);
        } finally {
          setIsUpdating(false);
        }
      }, 300);

      setDebounceTimer(timer);
    },
    [light.id, onBrightness, debounceTimer]
  );

  // Sync local brightness when light prop changes
  if (light.brightness !== localBrightness && !debounceTimer) {
    setLocalBrightness(light.brightness);
  }

  return (
    <Widget
      isLoading={isLoading}
      className={cn(
        "min-w-[200px]",
        isOn && "shadow-[0_0_30px_rgba(251,191,36,0.15)]"
      )}
    >
      {/* Header with icon and name */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "p-2 rounded-full transition-all duration-300",
              isOn
                ? "bg-amber-glow/20 text-amber-glow shadow-[0_0_15px_rgba(251,191,36,0.3)]"
                : "bg-foreground/10 text-foreground/40"
            )}
          >
            <Lightbulb className="w-5 h-5" />
          </div>
          <span className="font-medium text-foreground">{light.name}</span>
        </div>
      </div>

      {/* Toggle */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm text-foreground/60">
          {isOn ? "On" : "Off"}
        </span>
        <Toggle
          checked={isOn}
          onChange={handleToggle}
          disabled={isUpdating}
        />
      </div>

      {/* Brightness slider */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-foreground/60">Brightness</span>
          <span className="text-foreground font-medium">{localBrightness}%</span>
        </div>
        <Slider
          value={localBrightness}
          onChange={handleBrightnessChange}
          disabled={!isOn || isUpdating}
        />
      </div>
    </Widget>
  );
}
