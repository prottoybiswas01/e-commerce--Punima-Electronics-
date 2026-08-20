import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { couponSchema } from "@/lib/validators";
import { getAdminSession } from "@/lib/auth/session";

export async function POST(req: Request) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const data = couponSchema.parse(body);

    const coupon = await prisma.coupon.create({
      data: {
        code: data.code,
        type: data.type,
        value: data.value,
        minOrderAmount: data.minOrderAmount,
        maxDiscount: data.maxDiscount || null,
        usageLimit: data.usageLimit || null,
        perCustomerLimit: data.perCustomerLimit || 1,
        startDate: new Date(data.startDate),
        endDate: data.endDate ? new Date(data.endDate) : null,
        isActive: data.isActive,
        freeShipping: data.type === "FREE_SHIPPING",
      },
    });

    await prisma.auditLog.create({
      data: {
        userName: session.name,
        action: "CREATE_COUPON",
        entity: "Coupon",
        entityId: coupon.id,
        newState: JSON.stringify(coupon),
      },
    });

    return NextResponse.json({ success: true, coupon });
  } catch (error: any) {
    console.error("[Coupon Create Error]", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to create coupon" },
      { status: 400 }
    );
  }
}
