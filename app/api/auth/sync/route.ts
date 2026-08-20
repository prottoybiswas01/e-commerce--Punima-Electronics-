import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { firebaseUid, email, name, phone } = await req.json();

    if (!firebaseUid || !email) {
      return NextResponse.json(
        { success: false, message: "Firebase UID and email required" },
        { status: 400 }
      );
    }

    // Upsert User and Customer
    const user = await prisma.user.upsert({
      where: { email },
      create: {
        firebaseUid,
        email,
        name: name || email.split("@")[0],
        phone: phone || null,
        role: "CUSTOMER",
        customer: {
          create: {
            name: name || email.split("@")[0],
            email,
            phone: phone || "01700000000",
          },
        },
      },
      update: {
        firebaseUid,
        name: name || undefined,
        phone: phone || undefined,
      },
      include: {
        customer: {
          include: {
            addresses: true,
          },
        },
      },
    });

    return NextResponse.json({ success: true, user, customer: user.customer });
  } catch (error: any) {
    console.error("[Auth Sync Error]", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to sync auth user" },
      { status: 500 }
    );
  }
}
