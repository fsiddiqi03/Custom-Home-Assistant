"use client";

/**
 * SWR hook for temperature data fetching
 */

import useSWR from "swr";
import type { Temperature } from "@/types";
import { POLLING_INTERVALS } from "@/lib/utils/constants";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useTemp() {
  const { data, error, isLoading, mutate } = useSWR<Temperature>(
    "/api/temp",
    fetcher,
    {
      refreshInterval: POLLING_INTERVALS.TEMPERATURE,
      revalidateOnFocus: true,
    }
  );

  return {
    temperature: data ?? null,
    isLoading,
    error: error?.message,
    refresh: mutate,
  };
}
