"use client";

/**
 * Slider component for brightness/value controls
 */

import { cn } from "@/lib/utils/cn";

interface SliderProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  className?: string;
}

export function Slider({
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  disabled = false,
  className,
}: SliderProps) {
  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div className={cn("relative w-full", className)}>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        disabled={disabled}
        className={cn(
          "w-full h-2 appearance-none cursor-pointer rounded-full",
          "bg-foreground/10",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "[&::-webkit-slider-thumb]:appearance-none",
          "[&::-webkit-slider-thumb]:h-5",
          "[&::-webkit-slider-thumb]:w-5",
          "[&::-webkit-slider-thumb]:rounded-full",
          "[&::-webkit-slider-thumb]:bg-primary",
          "[&::-webkit-slider-thumb]:shadow-md",
          "[&::-webkit-slider-thumb]:cursor-pointer",
          "[&::-webkit-slider-thumb]:transition-transform",
          "[&::-webkit-slider-thumb]:hover:scale-110",
          "[&::-moz-range-thumb]:h-5",
          "[&::-moz-range-thumb]:w-5",
          "[&::-moz-range-thumb]:rounded-full",
          "[&::-moz-range-thumb]:bg-primary",
          "[&::-moz-range-thumb]:border-0",
          "[&::-moz-range-thumb]:shadow-md",
          "[&::-moz-range-thumb]:cursor-pointer"
        )}
        style={{
          background: `linear-gradient(to right, var(--primary) 0%, var(--primary) ${percentage}%, var(--foreground) ${percentage}%, var(--foreground) 100%)`,
          backgroundSize: "100%",
          opacity: disabled ? 0.5 : 1,
        }}
      />
    </div>
  );
}
