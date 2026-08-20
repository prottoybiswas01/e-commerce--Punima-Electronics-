import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth/session";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const order = await prisma.order.findUnique({
      where: { id: params.id },
      include: {
        items: true,
        timeline: { orderBy: { createdAt: "asc" } },
        courierShipment: true,
      },
    });

    if (!order) {
      return NextResponse.json({ success: false, message: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, order });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    // Delete related child items in order
    await prisma.couponUsage.deleteMany({ where: { orderId: params.id } });
    await prisma.orderTimeline.deleteMany({ where: { orderId: params.id } });
    await prisma.orderItem.deleteMany({ where: { orderId: params.id } });
    await prisma.payment.deleteMany({ where: { orderId: params.id } });
    await prisma.returnRequest.deleteMany({ where: { orderId: params.id } });
    await prisma.courierShipment.deleteMany({ where: { orderId: params.id } });

    await prisma.order.delete({
      where: { id: params.id },
    });

    await prisma.auditLog.create({
      data: {
        userName: session.name,
        action: "DELETE_ORDER",
        entity: "Order",
        entityId: params.id,
      },
    });

    return NextResponse.json({ success: true, message: "Order deleted successfully" });
  } catch (error: any) {
    console.error("[Order Delete Error]", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to delete order" },
      { status: 500 }
    );
  }
}
