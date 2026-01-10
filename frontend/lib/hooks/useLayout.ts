"use client";

/**
 * Hook for persisting widget layout to localStorage
 */

import { useState, useEffect, useCallback } from "react";
import { LIGHT_IDS } from "@/lib/utils/constants";

const STORAGE_KEY = "home-dashboard-layout";

export interface WidgetLayoutItem {
  id: string;
  type: "light" | "temperature" | "calendar";
  order: number;
}

interface LayoutState {
  widgets: WidgetLayoutItem[];
  version: number;
}

const DEFAULT_LAYOUT: LayoutState = {
  widgets: [
    { id: LIGHT_IDS.FRONTDOOR, type: "light", order: 0 },
    { id: LIGHT_IDS.LIVING, type: "light", order: 1 },
    { id: LIGHT_IDS.DESK, type: "light", order: 2 },
    { id: LIGHT_IDS.TV, type: "light", order: 3 },
    { id: "temperature", type: "temperature", order: 4 },
    { id: "calendar", type: "calendar", order: 5 },
  ],
  version: 2, // Bumped version to trigger layout reset for existing users
};

export function useLayout() {
  const [layout, setLayout] = useState<LayoutState>(DEFAULT_LAYOUT);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as LayoutState;
        // Only use stored layout if version matches
        if (parsed.widgets && Array.isArray(parsed.widgets) && parsed.version === DEFAULT_LAYOUT.version) {
          setLayout(parsed);
        } else {
          // Version mismatch - use default and save it
          localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_LAYOUT));
        }
      }
    } catch (error) {
      console.error("Failed to load layout from localStorage:", error);
    }
    setIsLoaded(true);
  }, []);

  // Save to localStorage whenever layout changes
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(layout));
      } catch (error) {
        console.error("Failed to save layout to localStorage:", error);
      }
    }
  }, [layout, isLoaded]);

  const updateWidgetOrder = useCallback((widgetIds: string[]) => {
    setLayout((prev) => ({
      ...prev,
      widgets: widgetIds.map((id, index) => {
        const existing = prev.widgets.find((w) => w.id === id);
        return existing
          ? { ...existing, order: index }
          : { id, type: "light" as const, order: index };
      }),
    }));
  }, []);

  const getOrderedWidgetIds = useCallback((): string[] => {
    return [...layout.widgets]
      .sort((a, b) => a.order - b.order)
      .map((w) => w.id);
  }, [layout.widgets]);

  const resetLayout = useCallback(() => {
    setLayout(DEFAULT_LAYOUT);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return {
    layout,
    isLoaded,
    updateWidgetOrder,
    getOrderedWidgetIds,
    resetLayout,
  };
}
