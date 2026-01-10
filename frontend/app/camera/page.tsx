"use client";

/**
 * Camera Page
 * Live camera feed and motion detection alert history
 */

import { useState, useCallback } from "react";
import { RefreshCw } from "lucide-react";
import { LiveFeed } from "@/components/camera/LiveFeed";
import { AlertList } from "@/components/camera/AlertList";
import { AlertFilters } from "@/components/camera/AlertFilters";
import { AlertModal } from "@/components/camera/AlertModal";
import { useAlerts } from "@/lib/hooks/useAlerts";
import type { Alert } from "@/types";

export default function CameraPage() {
  const {
    alerts,
    isLoading,
    error,
    filters,
    updateFilters,
    clearFilters,
    refresh,
  } = useAlerts();

  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await refresh();
    setIsRefreshing(false);
  }, [refresh]);

  const handleSelectAlert = useCallback((alert: Alert) => {
    setSelectedAlert(alert);
  }, []);

  const handleCloseModal = useCallback(() => {
    setSelectedAlert(null);
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-foreground mb-2">
          Security Camera
        </h1>
        <p className="text-foreground/60">
          Live feed and motion detection alerts
        </p>
      </div>

      {/* Live Feed Section */}
      <section className="mb-8">
        <LiveFeed />
      </section>

      {/* Alerts Section */}
      <section>
        {/* Section header with filters */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-foreground">
              Motion Alerts
            </h2>
            <p className="text-sm text-foreground/60 mt-1">
              {alerts.length} {alerts.length === 1 ? "alert" : "alerts"} found
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Refresh button */}
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border hover:bg-background transition-colors disabled:opacity-50"
            >
              <RefreshCw
                className={`w-4 h-4 text-foreground/60 ${isRefreshing ? "animate-spin" : ""}`}
              />
              <span className="text-sm font-medium text-foreground">
                Refresh
              </span>
            </button>

            {/* Date filters */}
            <AlertFilters
              startDate={filters.startDate}
              endDate={filters.endDate}
              onFilter={updateFilters}
              onClear={clearFilters}
            />
          </div>
        </div>

        {/* Alert list */}
        <AlertList
          alerts={alerts}
          isLoading={isLoading}
          error={error}
          onSelectAlert={handleSelectAlert}
        />
      </section>

      {/* Video playback modal */}
      <AlertModal alert={selectedAlert} onClose={handleCloseModal} />
    </div>
  );
}
