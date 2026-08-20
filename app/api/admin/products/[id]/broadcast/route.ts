import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth/session";
import { broadcastNewProductEmail } from "@/lib/email/resend";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { targetEmail } = await req.json().catch(() => ({ targetEmail: undefined }));

    const product = await prisma.product.findUnique({
      where: { id: params.id },
      include: { images: true },
    });

    if (!product) {
      return NextResponse.json({ success: false, message: "Product not found" }, { status: 404 });
    }

    const result = await broadcastNewProductEmail({
      product,
      targetEmail,
    });

    return NextResponse.json({
      success: result.success,
      message: result.success
        ? `Broadcast email sent to ${result.sentCount} customer(s)!`
        : result.errors?.[0]?.error?.message || "Failed to broadcast email",
      result,
    });
  } catch (error: any) {
    console.error("[Manual Broadcast Error]", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to trigger broadcast" },
      { status: 500 }
    );
  }
}
