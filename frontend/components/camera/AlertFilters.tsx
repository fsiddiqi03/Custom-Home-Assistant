"use client";

/**
 * Alert Filters component
 * Date range picker for filtering security alerts
 */

import { useState } from "react";
import { Calendar, X, Filter } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface AlertFiltersProps {
  startDate?: string;
  endDate?: string;
  onFilter: (filters: { startDate?: string; endDate?: string }) => void;
  onClear: () => void;
}

export function AlertFilters({
  startDate,
  endDate,
  onFilter,
  onClear,
}: AlertFiltersProps) {
  const [localStartDate, setLocalStartDate] = useState(startDate || "");
  const [localEndDate, setLocalEndDate] = useState(endDate || "");
  const [isExpanded, setIsExpanded] = useState(false);

  const hasFilters = startDate || endDate;

  const handleApply = () => {
    onFilter({
      startDate: localStartDate || undefined,
      endDate: localEndDate || undefined,
    });
    setIsExpanded(false);
  };

  const handleClear = () => {
    setLocalStartDate("");
    setLocalEndDate("");
    onClear();
    setIsExpanded(false);
  };

  // Quick filter presets
  const applyPreset = (days: number) => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - days);

    const startStr = start.toISOString().split("T")[0];
    const endStr = end.toISOString().split("T")[0];

    setLocalStartDate(startStr);
    setLocalEndDate(endStr);
    onFilter({ startDate: startStr, endDate: endStr });
    setIsExpanded(false);
  };

  return (
    <div className="relative">
      {/* Filter button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={cn(
          "flex items-center gap-2 px-4 py-2 rounded-lg transition-colors",
          "border border-border hover:bg-background",
          hasFilters && "bg-primary/10 border-primary/30"
        )}
      >
        <Filter className={cn("w-4 h-4", hasFilters ? "text-primary" : "text-foreground/60")} />
        <span className={cn("text-sm font-medium", hasFilters ? "text-primary" : "text-foreground")}>
          {hasFilters ? "Filtered" : "Filter"}
        </span>
        {hasFilters && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleClear();
            }}
            className="ml-1 p-0.5 rounded hover:bg-primary/20"
          >
            <X className="w-3 h-3 text-primary" />
          </button>
        )}
      </button>

      {/* Filter dropdown */}
      {isExpanded && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsExpanded(false)}
          />

          {/* Dropdown panel */}
          <div className="absolute right-0 top-full mt-2 z-50 w-80 bg-card border border-border rounded-xl shadow-lg p-4">
            <h3 className="font-medium text-foreground mb-4">Filter by Date</h3>

            {/* Quick presets */}
            <div className="flex flex-wrap gap-2 mb-4">
              <button
                onClick={() => applyPreset(1)}
                className="px-3 py-1.5 text-xs font-medium bg-background border border-border rounded-lg hover:bg-foreground/5 transition-colors"
              >
                Today
              </button>
              <button
                onClick={() => applyPreset(7)}
                className="px-3 py-1.5 text-xs font-medium bg-background border border-border rounded-lg hover:bg-foreground/5 transition-colors"
              >
                Last 7 days
              </button>
              <button
                onClick={() => applyPreset(30)}
                className="px-3 py-1.5 text-xs font-medium bg-background border border-border rounded-lg hover:bg-foreground/5 transition-colors"
              >
                Last 30 days
              </button>
            </div>

            {/* Date inputs */}
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-foreground/60 mb-1.5">
                  Start Date
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" />
                  <input
                    type="date"
                    value={localStartDate}
                    onChange={(e) => setLocalStartDate(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-foreground/60 mb-1.5">
                  End Date
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" />
                  <input
                    type="date"
                    value={localEndDate}
                    onChange={(e) => setLocalEndDate(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 mt-4">
              <button
                onClick={handleClear}
                className="flex-1 px-4 py-2 text-sm font-medium text-foreground/60 border border-border rounded-lg hover:bg-background transition-colors"
              >
                Clear
              </button>
              <button
                onClick={handleApply}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary/90 transition-colors"
              >
                Apply
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
