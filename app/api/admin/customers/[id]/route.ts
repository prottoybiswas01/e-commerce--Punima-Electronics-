import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth/session";

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { isBlocked, notes, name, email } = await req.json();

    const customer = await prisma.customer.update({
      where: { id: params.id },
      data: {
        isBlocked: isBlocked !== undefined ? Boolean(isBlocked) : undefined,
        notes: notes !== undefined ? notes : undefined,
        name: name || undefined,
        email: email || undefined,
      },
    });

    await prisma.auditLog.create({
      data: {
        userName: session.name,
        action: isBlocked !== undefined ? (isBlocked ? "BLOCK_CUSTOMER" : "UNBLOCK_CUSTOMER") : "UPDATE_CUSTOMER",
        entity: "Customer",
        entityId: customer.id,
        newState: JSON.stringify(customer),
      },
    });

    return NextResponse.json({ success: true, customer });
  } catch (error: any) {
    console.error("[Customer Update Error]", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to update customer" },
      { status: 500 }
    );
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

    // Check order count
    const orderCount = await prisma.order.count({
      where: { customerId: params.id },
    });

    if (orderCount > 0) {
      // Unlink customer from orders rather than deleting orders, or block the customer
      await prisma.order.updateMany({
        where: { customerId: params.id },
        data: { customerId: null },
      });
    }

    // Clean up related sub-collections
    await prisma.address.deleteMany({ where: { customerId: params.id } });
    await prisma.cart.deleteMany({ where: { customerId: params.id } });
    await prisma.wishlist.deleteMany({ where: { customerId: params.id } });

    await prisma.customer.delete({
      where: { id: params.id },
    });

    await prisma.auditLog.create({
      data: {
        userName: session.name,
        action: "DELETE_CUSTOMER",
        entity: "Customer",
        entityId: params.id,
      },
    });

    return NextResponse.json({ success: true, message: "Customer deleted successfully" });
  } catch (error: any) {
    console.error("[Customer Delete Error]", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to delete customer" },
      { status: 500 }
    );
  }
}
