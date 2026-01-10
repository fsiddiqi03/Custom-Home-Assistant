"use client";

/**
 * Toggle switch component for on/off controls
 */

import { cn } from "@/lib/utils/cn";

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
}

export function Toggle({
  checked,
  onChange,
  disabled = false,
  className,
}: ToggleProps) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => !disabled && onChange(!checked)}
      disabled={disabled}
      className={cn(
        "relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full",
        "border-2 border-transparent transition-colors duration-200",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
        "disabled:cursor-not-allowed disabled:opacity-50",
        checked ? "bg-primary" : "bg-foreground/20",
        className
      )}
    >
      <span
        className={cn(
          "pointer-events-none inline-block h-6 w-6 transform rounded-full",
          "bg-white shadow-lg ring-0 transition-transform duration-200",
          checked ? "translate-x-5" : "translate-x-0"
        )}
      />
    </button>
  );
}
