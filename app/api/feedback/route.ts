import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { errorId, message, category, route, userEmail, userId, deviceInfo } =
      await req.json();

    if (!message || !message.trim()) {
      return NextResponse.json(
        { success: false, message: "Feedback message cannot be empty" },
        { status: 400 }
      );
    }

    const feedback = await prisma.userFeedback.create({
      data: {
        errorId: errorId || null,
        message: message.trim(),
        category: category || "BUG_REPORT",
        route: route || "/",
        userEmail: userEmail || null,
        userId: userId || null,
        deviceInfo: deviceInfo || null,
        status: "NEW",
      },
    });

    return NextResponse.json({ success: true, feedbackId: feedback.id });
  } catch (error: any) {
    console.error("[Feedback Submission Error]", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to submit feedback" },
      { status: 500 }
    );
  }
}
