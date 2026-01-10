/**
 * Lights API - Get all lights state
 * Fetches state from Hue and Govee endpoints
 */

import { NextResponse } from "next/server";
import { HOME_API_URL, LIGHTS_CONFIG, GOVEE_SKU } from "@/lib/utils/constants";
import type { Light } from "@/types";

async function fetchHueLight(deviceId: string): Promise<{ on: boolean; brightness: number } | null> {
  try {
    const response = await fetch(`${HOME_API_URL}/lights/hue/${deviceId}`, {
      cache: "no-store",
    });
    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  }
}

async function fetchHueGroup(deviceId: string): Promise<{ on: boolean; brightness: number } | null> {
  try {
    const response = await fetch(`${HOME_API_URL}/lights/hue/group/${deviceId}`, {
      cache: "no-store",
    });
    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  }
}

async function fetchGoveeDevice(sku: string, deviceId: string): Promise<{ on: boolean; brightness: number } | null> {
  try {
    const response = await fetch(`${HOME_API_URL}/lights/govee/${sku}/${deviceId}`, {
      cache: "no-store",
    });
    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  }
}

export async function GET() {
  try {
    const lights: Light[] = [];

    // Fetch all lights in parallel
    const fetchPromises = LIGHTS_CONFIG.map(async (config) => {
      let state: { on: boolean; brightness: number } | null = null;

      if (config.type === "hue") {
        state = await fetchHueLight(config.deviceId);
      } else if (config.type === "hue_group") {
        state = await fetchHueGroup(config.deviceId);
      } else if (config.type === "govee") {
        state = await fetchGoveeDevice(config.sku || GOVEE_SKU, config.deviceId);
      }

      if (state) {
        lights.push({
          id: config.id,
          name: config.name,
          type: config.type,
          state: state.on ? "on" : "off",
          brightness: state.brightness,
          deviceId: config.deviceId,
          sku: config.type === "govee" ? config.sku : undefined,
        });
      }
    });

    await Promise.all(fetchPromises);

    // Sort lights to maintain consistent order
    lights.sort((a, b) => {
      const orderA = LIGHTS_CONFIG.findIndex((c) => c.id === a.id);
      const orderB = LIGHTS_CONFIG.findIndex((c) => c.id === b.id);
      return orderA - orderB;
    });

    return NextResponse.json({ lights });
  } catch (error) {
    console.error("Lights API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
