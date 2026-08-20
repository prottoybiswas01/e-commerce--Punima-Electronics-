import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth/session";

export async function POST(req: Request) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { name, phone, email, notes } = await req.json();

    if (!name || !phone) {
      return NextResponse.json(
        { success: false, message: "Name and phone number are required" },
        { status: 400 }
      );
    }

    const cleanPhone = phone.trim();
    const cleanEmail = email ? email.trim().toLowerCase() : null;

    const existing = await prisma.customer.findUnique({
      where: { phone: cleanPhone },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, message: "A customer with this phone number already exists" },
        { status: 400 }
      );
    }

    const customer = await prisma.customer.create({
      data: {
        name,
        phone: cleanPhone,
        email: cleanEmail,
        notes,
      },
    });

    await prisma.auditLog.create({
      data: {
        userName: session.name,
        action: "CREATE_CUSTOMER",
        entity: "Customer",
        entityId: customer.id,
        newState: JSON.stringify(customer),
      },
    });

    return NextResponse.json({ success: true, customer });
  } catch (error: any) {
    console.error("[Customer Create Error]", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to create customer" },
      { status: 500 }
    );
  }
}
