"use client";

/**
 * SWR hook for alerts/videos data fetching
 */

import useSWR from "swr";
import { useState, useCallback } from "react";
import type { Alert, AlertsResponse } from "@/types";

interface UseAlertsOptions {
  startDate?: string;
  endDate?: string;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

function buildUrl(startDate?: string, endDate?: string): string {
  const params = new URLSearchParams();
  if (startDate) params.append("start_date", startDate);
  if (endDate) params.append("end_date", endDate);
  const queryString = params.toString();
  return queryString ? `/api/alerts?${queryString}` : "/api/alerts";
}

export function useAlerts(options: UseAlertsOptions = {}) {
  const [filters, setFilters] = useState<UseAlertsOptions>(options);

  const url = buildUrl(filters.startDate, filters.endDate);

  const { data, error, isLoading, mutate } = useSWR<AlertsResponse>(
    url,
    fetcher,
    {
      revalidateOnFocus: true,
    }
  );

  const updateFilters = useCallback((newFilters: UseAlertsOptions) => {
    setFilters(newFilters);
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({});
  }, []);

  return {
    alerts: data?.alerts ?? [],
    isLoading,
    error: error?.message,
    filters,
    updateFilters,
    clearFilters,
    refresh: mutate,
  };
}
