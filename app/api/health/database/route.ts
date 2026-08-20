import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  const start = Date.now();
  try {
    const productCount = await prisma.product.count({ where: { isActive: true } });
    const latencyMs = Date.now() - start;

    return NextResponse.json({
      status: "UP",
      service: "database",
      latencyMs,
      details: { activeProductsCount: productCount },
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        status: "DOWN",
        service: "database",
        error: "Database connection failed",
        latencyMs: Date.now() - start,
      },
      { status: 503 }
    );
  }
}
