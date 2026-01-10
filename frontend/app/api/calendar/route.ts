/**
 * Calendar API proxy
 * Proxies requests to Pi1 FastAPI backend
 */

import { NextResponse } from "next/server";
import { PI1_API_URL } from "@/lib/utils/constants";

export async function GET() {
  try {
    const response = await fetch(`${PI1_API_URL}/api/calendar/today`, {
      cache: "no-store",
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to fetch calendar events" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Calendar API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
