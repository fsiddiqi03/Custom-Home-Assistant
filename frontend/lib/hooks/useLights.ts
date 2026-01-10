"use client";

/**
 * SWR hook for lights data fetching and mutations
 */

import useSWR from "swr";
import type { Light, LightsResponse } from "@/types";
import { POLLING_INTERVALS } from "@/lib/utils/constants";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useLights() {
  const { data, error, isLoading, mutate } = useSWR<LightsResponse>(
    "/api/lights",
    fetcher,
    {
      refreshInterval: POLLING_INTERVALS.LIGHTS,
      revalidateOnFocus: true,
    }
  );

  const toggleLight = async (id: string, state: "on" | "off") => {
    // Optimistic update
    const optimisticData = data
      ? {
          lights: data.lights.map((light) =>
            light.id === id ? { ...light, state } : light
          ),
        }
      : undefined;

    await mutate(
      async () => {
        const response = await fetch(`/api/lights/${id}/state`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ state }),
        });

        if (!response.ok) {
          throw new Error("Failed to toggle light");
        }

        // Return current data to trigger a revalidation
        return data;
      },
      {
        optimisticData,
        rollbackOnError: true,
        revalidate: true,
      }
    );
  };

  const setBrightness = async (id: string, brightness: number) => {
    // Optimistic update
    const optimisticData = data
      ? {
          lights: data.lights.map((light) =>
            light.id === id ? { ...light, brightness } : light
          ),
        }
      : undefined;

    await mutate(
      async () => {
        const response = await fetch(`/api/lights/${id}/brightness`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ brightness }),
        });

        if (!response.ok) {
          throw new Error("Failed to set brightness");
        }

        return data;
      },
      {
        optimisticData,
        rollbackOnError: true,
        revalidate: true,
      }
    );
  };

  return {
    lights: data?.lights ?? [],
    isLoading,
    error: error?.message,
    toggleLight,
    setBrightness,
    refresh: mutate,
  };
}
