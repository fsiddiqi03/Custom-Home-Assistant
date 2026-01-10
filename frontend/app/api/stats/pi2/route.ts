/**
 * Pi2 Stats API proxy
 * Proxies requests to Pi2 HomeAPI backend
 */

import { NextResponse } from "next/server";
import { PI2_API_URL } from "@/lib/utils/constants";

export async function GET() {
  try {
    const response = await fetch(`${PI2_API_URL}/api/stats`, {
      cache: "no-store",
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to fetch Pi2 stats" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Pi2 stats API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
