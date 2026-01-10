"use client";

/**
 * Base Widget wrapper component
 * Provides consistent styling and structure for all dashboard widgets
 */

import { GripVertical } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { useEditMode } from "@/components/layout/EditModeProvider";

interface WidgetProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  icon?: React.ReactNode;
  isLoading?: boolean;
}

export function Widget({
  children,
  className,
  title,
  icon,
  isLoading = false,
}: WidgetProps) {
  const { isEditMode } = useEditMode();

  return (
    <div
      className={cn(
        "bg-card border border-border rounded-2xl p-5 transition-all relative",
        "hover:border-border/80 hover:shadow-md",
        isEditMode && "border-dashed border-primary/50 cursor-grab active:cursor-grabbing",
        className
      )}
    >
      {/* Drag handle indicator */}
      {isEditMode && (
        <div className="absolute top-2 right-2 p-1 rounded bg-primary/10 text-primary/60">
          <GripVertical className="w-4 h-4" />
        </div>
      )}

      {(title || icon) && (
        <div className="flex items-center gap-2 mb-4">
          {icon && <div className="text-foreground/60">{icon}</div>}
          {title && (
            <h3 className="text-sm font-medium text-foreground/80">{title}</h3>
          )}
        </div>
      )}
      {isLoading ? <WidgetSkeleton /> : children}
    </div>
  );
}

function WidgetSkeleton() {
  return (
    <div className="space-y-3 animate-pulse">
      <div className="h-8 bg-foreground/10 rounded w-1/2" />
      <div className="h-4 bg-foreground/10 rounded w-3/4" />
    </div>
  );
}
