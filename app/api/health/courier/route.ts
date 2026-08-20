import { NextResponse } from "next/server";
import { getCourierProvider } from "@/lib/courier";

export async function GET() {
  const start = Date.now();
  try {
    const courier = getCourierProvider("PATHAO");
    const cities = await courier.getCities();
    const latencyMs = Date.now() - start;

    return NextResponse.json({
      status: "UP",
      service: "pathao_courier",
      latencyMs,
      citiesAvailable: cities.length,
      mode: process.env.PATHAO_CLIENT_ID?.includes("sandbox") || !process.env.PATHAO_CLIENT_ID ? "SANDBOX_SIMULATION" : "LIVE",
    });
  } catch (error: any) {
    return NextResponse.json({
      status: "DEGRADED",
      service: "pathao_courier",
      latencyMs: Date.now() - start,
      circuitBreaker: "OPEN",
      fallbackActive: true,
      message: "Pathao API is currently degraded. Orders will queue and proceed via fallback.",
    });
  }
}
