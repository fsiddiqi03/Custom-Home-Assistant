/**
 * Temperature API proxy
 * Fetches temperature from Home API sensors endpoint
 */

import { NextResponse } from "next/server";
import { HOME_API_URL } from "@/lib/utils/constants";

export async function GET() {
  try {
    const response = await fetch(`${HOME_API_URL}/sensors/temperature`, {
      cache: "no-store",
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to fetch temperature" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Temperature API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
