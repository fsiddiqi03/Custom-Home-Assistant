/**
 * Light State API - Control light on/off
 * Uses PUT requests with query params as per Home API spec
 */

import { NextRequest, NextResponse } from "next/server";
import { HOME_API_URL, LIGHTS_CONFIG, GOVEE_SKU } from "@/lib/utils/constants";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const state = body.state === "on";

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
      url = `${HOME_API_URL}/lights/hue/${lightConfig.deviceId}/power?state=${state}`;
    } else if (lightConfig.type === "hue_group") {
      url = `${HOME_API_URL}/lights/hue/group/${lightConfig.deviceId}/power?state=${state}`;
    } else {
      // govee
      const sku = lightConfig.sku || GOVEE_SKU;
      url = `${HOME_API_URL}/lights/govee/${sku}/${lightConfig.deviceId}/power?state=${state}`;
    }

    const response = await fetch(url, {
      method: "PUT",
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Power API error:", errorText);
      return NextResponse.json(
        { error: "Failed to update light state" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Light state API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
