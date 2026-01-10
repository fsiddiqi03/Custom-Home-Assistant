/**
 * Individual Light API - Get specific light state
 */

import { NextRequest, NextResponse } from "next/server";
import { HOME_API_URL, LIGHTS_CONFIG, GOVEE_SKU } from "@/lib/utils/constants";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Find the light configuration
    const lightConfig = LIGHTS_CONFIG.find((c) => c.id === id);
    if (!lightConfig) {
      return NextResponse.json(
        { error: "Light not found" },
        { status: 404 }
      );
    }

    let url: string;
    if (lightConfig.type === "hue") {
      url = `${HOME_API_URL}/lights/hue/${lightConfig.deviceId}`;
    } else if (lightConfig.type === "hue_group") {
      url = `${HOME_API_URL}/lights/hue/group/${lightConfig.deviceId}`;
    } else {
      // govee
      const sku = lightConfig.sku || GOVEE_SKU;
      url = `${HOME_API_URL}/lights/govee/${sku}/${lightConfig.deviceId}`;
    }

    const response = await fetch(url, { cache: "no-store" });

    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to fetch light" },
        { status: response.status }
      );
    }

    const state = await response.json();
    
    return NextResponse.json({
      id: lightConfig.id,
      name: lightConfig.name,
      type: lightConfig.type,
      state: state.on ? "on" : "off",
      brightness: state.brightness,
      deviceId: lightConfig.deviceId,
      sku: lightConfig.type === "govee" ? lightConfig.sku : undefined,
    });
  } catch (error) {
    console.error("Light API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
