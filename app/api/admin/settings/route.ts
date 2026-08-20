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

    const existing = await prisma.storeSettings.findFirst();
    let settings;

    if (existing) {
      settings = await prisma.storeSettings.update({
        where: { id: existing.id },
        data,
      });
    } else {
      settings = await prisma.storeSettings.create({
        data,
      });
    }

    await prisma.auditLog.create({
      data: {
        userName: session.name,
        action: "UPDATE_SETTINGS",
        entity: "StoreSettings",
        entityId: settings.id,
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
