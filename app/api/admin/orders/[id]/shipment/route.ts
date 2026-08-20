import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCourierProvider } from "@/lib/courier";
import { getAdminSession } from "@/lib/auth/session";

export async function POST(
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
      include: { items: true },
    });

    if (!order) {
      return NextResponse.json({ success: false, message: "Order not found" }, { status: 404 });
    }

    const courier = getCourierProvider(order.courierProvider || "PATHAO");

    // Calculate total weight and quantity
    const totalWeight = Math.max(0.5, order.items.reduce((sum, i) => sum + (i.quantity * 0.5), 0));
    const totalQuantity = order.items.reduce((sum, i) => sum + i.quantity, 0);

    const shipmentResult = await courier.createShipment({
      merchantOrderId: order.orderNumber,
      recipientName: order.customerName,
      recipientPhone: order.customerPhone,
      recipientAddress: `${order.addressLine}, ${order.upazila}, ${order.district}`,
      itemQuantity: totalQuantity,
      itemWeight: totalWeight,
      amountToCollect: order.paymentStatus === "PAID" ? 0 : order.totalAmount,
      itemDescription: order.items.map((i) => `${i.productName} (x${i.quantity})`).join(", "),
    });

    if (!shipmentResult.success) {
      return NextResponse.json(
        { success: false, message: shipmentResult.message || "Courier booking failed" },
        { status: 400 }
      );
    }

    // Save shipment record and update order
    await prisma.$transaction(async (tx) => {
      await tx.courierShipment.upsert({
        where: { orderId: order.id },
        create: {
          orderId: order.id,
          courierProvider: "PATHAO",
          consignmentId: shipmentResult.consignmentId,
          merchantOrderId: order.orderNumber,
          trackingCode: shipmentResult.trackingCode,
          trackingUrl: shipmentResult.trackingUrl,
          status: "BOOKED",
          codAmount: order.paymentStatus === "PAID" ? 0 : order.totalAmount,
          weight: totalWeight,
        },
        update: {
          consignmentId: shipmentResult.consignmentId,
          trackingCode: shipmentResult.trackingCode,
          trackingUrl: shipmentResult.trackingUrl,
          status: "BOOKED",
        },
      });

      await tx.order.update({
        where: { id: order.id },
        data: {
          orderStatus: "COURIER_BOOKED",
          consignmentId: shipmentResult.consignmentId,
          trackingCode: shipmentResult.trackingCode,
          courierTrackingUrl: shipmentResult.trackingUrl,
        },
      });

      await tx.orderTimeline.create({
        data: {
          orderId: order.id,
          status: "COURIER_BOOKED",
          title: "Pathao Courier Shipment Created",
          description: `Consignment ID: ${shipmentResult.consignmentId} generated. Ready for rider pickup.`,
          createdBy: session.name,
        },
      });

      await tx.auditLog.create({
        data: {
          userName: session.name,
          action: "CREATE_COURIER_SHIPMENT",
          entity: "Order",
          entityId: order.id,
          newState: JSON.stringify({ consignmentId: shipmentResult.consignmentId, courier: "Pathao" }),
        },
      });
    });

    return NextResponse.json({
      success: true,
      consignmentId: shipmentResult.consignmentId,
      trackingUrl: shipmentResult.trackingUrl,
    });
  } catch (error: any) {
    console.error("[Shipment Creation Error]", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to create shipment" },
      { status: 500 }
    );
  }
}
