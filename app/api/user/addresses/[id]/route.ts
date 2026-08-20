import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
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
    } = body;

    if (isDefault && customerId) {
      await prisma.address.updateMany({
        where: { customerId },
        data: { isDefault: false },
      });
    }

    const updated = await prisma.address.update({
      where: { id: params.id },
      data: {
        title,
        recipientName,
        phone,
        division,
        district,
        upazila,
        area,
        addressLine,
        isDefault,
      },
    });

    return NextResponse.json({ success: true, address: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.address.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true, message: "Address deleted" });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
