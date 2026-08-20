import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const {
      customerId,
      title,
      recipientName,
      phone,
      division,
      district,
      upazila,
      area,
      addressLine,
      isDefault,
    } = await req.json();

    if (!customerId || !recipientName || !phone || !addressLine) {
      return NextResponse.json(
        { success: false, message: "Missing required address fields" },
        { status: 400 }
      );
    }

    // If marked default, unset other defaults
    if (isDefault) {
      await prisma.address.updateMany({
        where: { customerId },
        data: { isDefault: false },
      });
    }

    const address = await prisma.address.create({
      data: {
        customerId,
        title: title || "Home",
        recipientName,
        phone,
        division: division || "Dhaka",
        district: district || "Dhaka",
        upazila: upazila || "Elephant Road",
        area: area || null,
        addressLine,
        isDefault: isDefault || false,
      },
    });

    return NextResponse.json({ success: true, address });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
