/**
 * Alerts API proxy
 * Proxies requests to Pi1 FastAPI backend
 */

import { NextRequest, NextResponse } from "next/server";
import { PI1_API_URL } from "@/lib/utils/constants";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const startDate = searchParams.get("start_date");
    const endDate = searchParams.get("end_date");

    let url = `${PI1_API_URL}/api/alerts`;
    const params = new URLSearchParams();

    if (startDate) params.append("start_date", startDate);
    if (endDate) params.append("end_date", endDate);

    if (params.toString()) {
      url += `?${params.toString()}`;
    }

    const response = await fetch(url);

    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to fetch alerts" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Alerts API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
