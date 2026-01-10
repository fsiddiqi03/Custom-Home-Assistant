"use client";

/**
 * Widget Grid container component
 * Horizontal scroll on desktop, vertical on mobile
 */

import { cn } from "@/lib/utils/cn";

interface WidgetGridProps {
  children: React.ReactNode;
  className?: string;
}

export function WidgetGrid({ children, className }: WidgetGridProps) {
  return (
    <div
      className={cn(
        // Mobile: vertical grid
        "grid grid-cols-1 gap-4",
        // Tablet: 2 columns
        "sm:grid-cols-2",
        // Desktop: horizontal scroll row
        "lg:flex lg:flex-row lg:overflow-x-auto lg:gap-4 lg:pb-4",
        // Scrollbar styling for desktop
        "lg:scrollbar-thin lg:scrollbar-thumb-border lg:scrollbar-track-background",
        className
      )}
    >
      {children}
    </div>
  );
}

interface WidgetGroupProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

export function WidgetGroup({ title, children, className }: WidgetGroupProps) {
  return (
    <section className={cn("space-y-4", className)}>
      <h2 className="text-lg font-semibold text-foreground/80">{title}</h2>
      <WidgetGrid>{children}</WidgetGrid>
    </section>
  );
}
