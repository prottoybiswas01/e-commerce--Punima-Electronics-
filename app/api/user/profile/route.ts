import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json({ success: false, message: "Email required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        customers: {
          include: {
            addresses: { orderBy: { isDefault: "desc" } },
            orders: { orderBy: { createdAt: "desc" }, take: 10 },
            reviews: { include: { product: true } },
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
    }

    const customer = user.customers?.[0] || null;

    return NextResponse.json({ success: true, user, customer });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const { email, name, phone, avatarUrl } = await req.json();

    if (!email) {
      return NextResponse.json({ success: false, message: "Email required" }, { status: 400 });
    }

    const user = await prisma.user.update({
      where: { email },
      data: {
        name: name || undefined,
        phone: phone || undefined,
        avatarUrl: avatarUrl || undefined,
      },
      include: {
        customers: true,
      },
    });

    let customer = user.customers?.[0];
    if (customer && (name || phone)) {
      customer = await prisma.customer.update({
        where: { id: customer.id },
        data: {
          name: name || undefined,
          phone: phone || undefined,
        },
      });
    }

    return NextResponse.json({ success: true, user, customer });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
