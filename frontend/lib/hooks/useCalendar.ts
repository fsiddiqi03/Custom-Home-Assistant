"use client";

/**
 * SWR hook for calendar events fetching
 */

import useSWR from "swr";
import type { CalendarResponse } from "@/types";
import { POLLING_INTERVALS } from "@/lib/utils/constants";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useCalendar() {
  const { data, error, isLoading, mutate } = useSWR<CalendarResponse>(
    "/api/calendar",
    fetcher,
    {
      refreshInterval: POLLING_INTERVALS.CALENDAR,
      revalidateOnFocus: true,
    }
  );

  return {
    events: data?.events ?? [],
    date: data?.date ?? null,
    isLoading,
    error: error?.message,
    refresh: mutate,
  };
}
