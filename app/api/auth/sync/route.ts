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

    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name || cleanEmail.split("@")[0];
    const userPhone = phone && phone.trim() ? phone.trim() : `g_${firebaseUid.slice(0, 10)}`;

    // 1. Find existing User by email
    let user = await prisma.user.findUnique({
      where: { email: cleanEmail },
      include: {
        customer: {
          include: { addresses: true },
        },
      },
    });

    if (user) {
      // Update Firebase UID and name if needed
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          firebaseUid,
          name: cleanName,
          phone: phone && phone.trim() ? phone.trim() : user.phone,
        },
        include: {
          customer: {
            include: { addresses: true },
          },
        },
      });

      // Ensure customer record is linked
      if (!user.customer) {
        const customer = await prisma.customer.create({
          data: {
            userId: user.id,
            name: cleanName,
            email: cleanEmail,
            phone: userPhone,
          },
          include: { addresses: true },
        });
        return NextResponse.json({ success: true, user, customer });
      }

      return NextResponse.json({ success: true, user, customer: user.customer });
    }

    // 2. Create new User and Customer safely
    const newUser = await prisma.user.create({
      data: {
        firebaseUid,
        email: cleanEmail,
        name: cleanName,
        phone: phone && phone.trim() ? phone.trim() : null,
        role: "CUSTOMER",
        customer: {
          create: {
            name: cleanName,
            email: cleanEmail,
            phone: userPhone,
          },
        },
      },
      include: {
        customer: {
          include: { addresses: true },
        },
      },
    });

    return NextResponse.json({ success: true, user: newUser, customer: newUser.customer });
  } catch (error: any) {
    console.error("[Auth Sync Error]", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to sync auth user" },
      { status: 500 }
    );
  }
}
