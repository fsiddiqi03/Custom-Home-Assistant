"use client";

/**
 * Home Dashboard Page
 * Main dashboard with draggable widgets for lights, temperature, and calendar
 */

import { useCallback, useMemo } from "react";
import { LightWidget } from "@/components/widgets/LightWidget";
import { TempWidget } from "@/components/widgets/TempWidget";
import { CalendarWidget } from "@/components/widgets/CalendarWidget";
import { DraggableWidgetGrid } from "@/components/layout/DraggableWidgetGrid";
import { useLights } from "@/lib/hooks/useLights";
import { useTemp } from "@/lib/hooks/useTemp";
import { useCalendar } from "@/lib/hooks/useCalendar";
import { useLayout } from "@/lib/hooks/useLayout";
import { useEditMode } from "@/components/layout/EditModeProvider";

export default function HomePage() {
  const { lights, isLoading: lightsLoading, error: lightsError, toggleLight, setBrightness } = useLights();
  const { temperature, isLoading: tempLoading, error: tempError } = useTemp();
  const { events, isLoading: calendarLoading, error: calendarError } = useCalendar();
  const { getOrderedWidgetIds, updateWidgetOrder, isLoaded } = useLayout();
  const { isEditMode } = useEditMode();

  // Get ordered widget IDs
  const orderedIds = useMemo(() => getOrderedWidgetIds(), [getOrderedWidgetIds]);

  // Create a map of light data by ID for quick lookup
  const lightsMap = useMemo(() => {
    const map = new Map();
    lights.forEach((light) => map.set(light.id, light));
    return map;
  }, [lights]);

  // Check if an ID represents a light widget
  const isLightWidget = useCallback((id: string) => {
    return id.startsWith("hue_") || id.startsWith("govee_");
  }, []);

  // Render widget by ID
  const renderWidget = useCallback(
    (id: string) => {
      // Check if it's a light widget
      if (isLightWidget(id)) {
        const light = lightsMap.get(id);
        if (!light && !lightsLoading) {
          return null;
        }
        if (lightsLoading && !light) {
          return (
            <div className="bg-card border border-border rounded-2xl p-5 min-w-[200px] animate-pulse">
              <div className="h-6 bg-foreground/10 rounded w-3/4 mb-4" />
              <div className="h-4 bg-foreground/10 rounded w-1/2 mb-4" />
              <div className="h-2 bg-foreground/10 rounded w-full" />
            </div>
          );
        }
        if (light) {
          return (
            <LightWidget
              light={light}
              onToggle={toggleLight}
              onBrightness={setBrightness}
              isLoading={false}
            />
          );
        }
        return null;
      }

      // Temperature widget
      if (id === "temperature") {
        return (
          <TempWidget
            temperature={temperature}
            isLoading={tempLoading}
            error={tempError}
          />
        );
      }

      // Calendar widget
      if (id === "calendar") {
        return (
          <CalendarWidget
            events={events}
            isLoading={calendarLoading}
            error={calendarError}
          />
        );
      }

      return null;
    },
    [
      isLightWidget,
      lightsMap,
      lightsLoading,
      toggleLight,
      setBrightness,
      temperature,
      tempLoading,
      tempError,
      events,
      calendarLoading,
      calendarError,
    ]
  );

  // Show loading state while layout loads from localStorage
  if (!isLoaded) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="h-10 bg-foreground/10 rounded w-1/3 mb-2 animate-pulse" />
          <div className="h-5 bg-foreground/10 rounded w-1/2 animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-foreground mb-2">
          Home Dashboard
        </h1>
        <p className="text-foreground/60">
          {isEditMode
            ? "Drag widgets to reorder them. Click Done when finished."
            : "Control your smart home devices and monitor your space"}
        </p>
      </div>

      {/* Edit mode banner */}
      {isEditMode && (
        <div className="mb-6 bg-primary/10 border border-primary/30 rounded-xl p-4">
          <p className="text-primary text-sm font-medium">
            Edit Mode Active - Drag widgets to rearrange. Your layout will be saved automatically.
          </p>
        </div>
      )}

      {/* Error state for lights */}
      {lightsError && (
        <div className="mb-6 bg-red-500/10 border border-red-500/20 rounded-2xl p-6">
          <p className="text-red-500">Failed to load lights: {lightsError}</p>
        </div>
      )}

      {/* Widgets Section */}
      <section>
        <h2 className="text-lg font-semibold text-foreground/80 mb-4">Widgets</h2>
        <DraggableWidgetGrid
          items={orderedIds}
          onReorder={updateWidgetOrder}
          renderItem={renderWidget}
        >
          {null}
        </DraggableWidgetGrid>
      </section>
    </div>
  );
}
