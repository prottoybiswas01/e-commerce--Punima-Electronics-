import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  const startTime = Date.now();
  let dbStatus = "UP";
  let dbLatency = 0;

  try {
    const dbStart = Date.now();
    await prisma.product.count({ take: 1 });
    dbLatency = Date.now() - dbStart;
  } catch (e) {
    dbStatus = "DOWN";
  }

  const overallStatus = dbStatus === "UP" ? "UP" : "DEGRADED";
  const totalLatency = Date.now() - startTime;

  return NextResponse.json({
    status: overallStatus,
    timestamp: new Date().toISOString(),
    service: "purnima-electronics-web",
    version: "1.0.0",
    environment: process.env.NODE_ENV || "production",
    latencyMs: totalLatency,
    checks: {
      database: { status: dbStatus, latencyMs: dbLatency },
      memoryUsageMb: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
      uptimeSeconds: Math.round(process.uptime()),
    },
  });
}
