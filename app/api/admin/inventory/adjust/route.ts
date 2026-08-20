import { NextResponse } from "next/server";
import { inventoryAdjustmentSchema } from "@/lib/validators";
import { adjustInventoryStock } from "@/lib/services/inventory.service";
import { getAdminSession } from "@/lib/auth/session";

export async function POST(req: Request) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const data = inventoryAdjustmentSchema.parse(body);

    const updated = await adjustInventoryStock({
      productId: data.productId,
      variantId: data.variantId,
      changeQuantity: data.changeQuantity,
      reason: data.reason,
      notes: data.notes,
      createdBy: session.name,
    });

    return NextResponse.json({ success: true, inventory: updated });
  } catch (error: any) {
    console.error("[Inventory Adjust Error]", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to adjust stock" },
      { status: 400 }
    );
  }
}
