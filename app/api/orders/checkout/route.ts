import { NextResponse } from "next/server";
import { checkoutSchema } from "@/lib/validators";
import { createOrder } from "@/lib/services/order.service";
import { sendOrderInvoiceEmail } from "@/lib/email/resend";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validatedData = checkoutSchema.parse(body);

    const order = await createOrder(validatedData);

    // If customer provided email, trigger automated Resend Order Confirmation & Digital Invoice
    if (order.customerEmail) {
      sendOrderInvoiceEmail({
        to: order.customerEmail,
        order,
      }).catch((err) => console.error("[Order Invoice Email Send Error]", err));
    }

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
