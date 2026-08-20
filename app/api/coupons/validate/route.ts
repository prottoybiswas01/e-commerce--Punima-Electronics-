import { NextResponse } from "next/server";
import { validateAndCalculateCoupon } from "@/lib/services/coupon.service";

export async function POST(req: Request) {
  try {
    const { code, subtotal, customerId } = await req.json();

    if (!code || typeof subtotal !== "number") {
      return NextResponse.json(
        { isValid: false, message: "Invalid request payload" },
        { status: 400 }
      );
    }

    const result = await validateAndCalculateCoupon(code, subtotal, customerId);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { isValid: false, message: error.message || "Failed to validate coupon" },
      { status: 500 }
    );
  }
}
