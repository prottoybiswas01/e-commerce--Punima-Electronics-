import { NextResponse } from "next/server";
import { updateOrderStatus } from "@/lib/services/order.service";
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

    const { status, note } = await req.json();
    if (!status) {
      return NextResponse.json({ success: false, message: "Status is required" }, { status: 400 });
    }

    const updated = await updateOrderStatus(
      params.id,
      status,
      { name: session.name, email: session.email },
      note
    );

    return NextResponse.json({ success: true, order: updated });
  } catch (error: any) {
    console.error("[Order Status Update Error]", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to update order status" },
      { status: 500 }
    );
  }
}
