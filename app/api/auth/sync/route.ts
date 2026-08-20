import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { sendWelcomeEmail } from "@/lib/email/resend";

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
        customers: {
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
          customers: {
            include: { addresses: true },
          },
        },
      });

      // Ensure customer record is linked
      let customer = user.customers?.[0];
      if (!customer) {
        // Find existing customer by email or phone to link
        customer = (await prisma.customer.findFirst({
          where: {
            OR: [
              { email: cleanEmail },
              { phone: userPhone },
            ],
          },
          include: { addresses: true },
        })) as any;

        if (customer) {
          customer = await prisma.customer.update({
            where: { id: customer.id },
            data: { userId: user.id, name: cleanName, email: cleanEmail },
            include: { addresses: true },
          });
        } else {
          customer = await prisma.customer.create({
            data: {
              userId: user.id,
              name: cleanName,
              email: cleanEmail,
              phone: userPhone,
            },
            include: { addresses: true },
          });
        }
      }

      return NextResponse.json({ success: true, user, customer });
    }

    // 2. Create new User and Customer safely
    const newUser = await prisma.user.create({
      data: {
        firebaseUid,
        email: cleanEmail,
        name: cleanName,
        phone: phone && phone.trim() ? phone.trim() : null,
        role: "CUSTOMER",
      },
    });

    // Check if an unlinked customer already existed with this email/phone (e.g. from guest orders)
    let customer = (await prisma.customer.findFirst({
      where: {
        OR: [
          { email: cleanEmail },
          { phone: userPhone },
        ],
      },
      include: { addresses: true },
    })) as any;

    if (customer) {
      customer = await prisma.customer.update({
        where: { id: customer.id },
        data: { userId: newUser.id, name: cleanName, email: cleanEmail },
        include: { addresses: true },
      });
    } else {
      customer = await prisma.customer.create({
        data: {
          userId: newUser.id,
          name: cleanName,
          email: cleanEmail,
          phone: userPhone,
        },
        include: { addresses: true },
      });
    }

    // Trigger automated welcome email via Resend in background
    sendWelcomeEmail({ to: cleanEmail, name: cleanName }).catch((err) =>
      console.error("[Welcome Email Trigger Error]", err)
    );

    return NextResponse.json({ success: true, user: newUser, customer });
  } catch (error: any) {
    console.error("[Auth Sync Error]", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to sync auth user" },
      { status: 500 }
    );
  }
}
