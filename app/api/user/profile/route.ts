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
        customer: {
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

    return NextResponse.json({ success: true, user, customer: user.customer });
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
        customer: {
          update: {
            name: name || undefined,
            phone: phone || undefined,
          },
        },
      },
      include: {
        customer: true,
      },
    });

    return NextResponse.json({ success: true, user, customer: user.customer });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
