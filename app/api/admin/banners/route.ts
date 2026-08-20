import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { bannerSchema } from "@/lib/validators";
import { getAdminSession } from "@/lib/auth/session";

export async function POST(req: Request) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const data = bannerSchema.parse(body);

    const banner = await prisma.banner.create({
      data: {
        title: data.title,
        subtitle: data.subtitle || null,
        ctaText: data.ctaText || "Shop Now",
        ctaLink: data.ctaLink || "/shop",
        imageUrl: data.imageUrl,
        mobileImageUrl: data.mobileImageUrl || null,
        displayOrder: data.displayOrder || 0,
        isActive: data.isActive,
      },
    });

    await prisma.auditLog.create({
      data: {
        userName: session.name,
        action: "CREATE_BANNER",
        entity: "Banner",
        entityId: banner.id,
        newState: JSON.stringify(banner),
      },
    });

    return NextResponse.json({ success: true, banner });
  } catch (error: any) {
    console.error("[Banner Create Error]", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to create banner" },
      { status: 400 }
    );
  }
}
