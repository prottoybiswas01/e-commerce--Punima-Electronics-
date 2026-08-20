import { NextResponse } from "next/server";
import { logSystemError } from "@/lib/monitoring/logger";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { message, stack, route, component, severity, browser, os } = body;

    const errorId = await logSystemError({
      error: new Error(message || "Client-side runtime error"),
      route: route || "/",
      component: component || null,
      severity: severity || "MEDIUM",
      browser: browser || null,
      os: os || null,
    });

    return NextResponse.json({ success: true, errorId });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
