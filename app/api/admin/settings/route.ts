import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { settingsSchema } from "@/lib/validators";
import { getAdminSession } from "@/lib/auth/session";

export async function POST(req: Request) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const data = settingsSchema.parse(body);

    const settings = await prisma.storeSettings.upsert({
      where: { id: "default" },
      create: {
        id: "default",
        ...data,
      },
      update: {
        ...data,
      },
    });

    await prisma.auditLog.create({
      data: {
        userName: session.name,
        action: "UPDATE_SETTINGS",
        entity: "StoreSettings",
        entityId: "default",
        newState: JSON.stringify(settings),
      },
    });

    return NextResponse.json({ success: true, settings });
  } catch (error: any) {
    console.error("[Settings Update Error]", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to update store settings" },
      { status: 400 }
    );
  }
}
