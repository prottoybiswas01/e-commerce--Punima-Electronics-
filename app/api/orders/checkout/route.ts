import { NextResponse } from "next/server";
import { checkoutSchema } from "@/lib/validators";
import { createOrder } from "@/lib/services/order.service";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validatedData = checkoutSchema.parse(body);

    const order = await createOrder(validatedData);

    return NextResponse.json({
      success: true,
      orderNumber: order.orderNumber,
      orderId: order.id,
      totalAmount: order.totalAmount,
    });
  } catch (error: any) {
    console.error("[Checkout API Error]", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to process checkout order",
      },
      { status: 400 }
    );
  }
}
