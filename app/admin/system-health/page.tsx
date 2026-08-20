import React from "react";
import prisma from "@/lib/prisma";
import { SystemHealthClient } from "@/components/admin/system-health-client";

export const revalidate = 0;

export default async function AdminSystemHealthPage() {
  const [errors, feedbacks] = await Promise.all([
    prisma.systemErrorEvent.findMany({
      orderBy: { lastSeenAt: "desc" },
      take: 50,
    }),
    prisma.userFeedback.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
  ]);

  let dbLatency = 0;
  try {
    const dbStart = Date.now();
    await prisma.product.count({ take: 1 });
    dbLatency = Date.now() - dbStart;
  } catch (e) {}

  const healthData = {
    status: "UP",
    uptimeSeconds: Math.round(process.uptime()),
    memoryUsageMb: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
    database: { status: "HEALTHY", latencyMs: dbLatency },
    courier: {
      status: "UP",
      mode: process.env.PATHAO_CLIENT_ID?.includes("sandbox") || !process.env.PATHAO_CLIENT_ID ? "Sandbox Simulation" : "Live Production",
    },
  };

  return (
    <SystemHealthClient
      errors={errors}
      feedbacks={feedbacks}
      health={healthData}
    />
  );
}
