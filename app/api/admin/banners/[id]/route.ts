import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth/session";

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { title, subtitle, ctaText, ctaLink, imageUrl, displayOrder, isActive } = await req.json();

    const banner = await prisma.banner.update({
      where: { id: params.id },
      data: {
        title: title !== undefined ? title : undefined,
        subtitle: subtitle !== undefined ? subtitle : undefined,
        ctaText: ctaText !== undefined ? ctaText : undefined,
        ctaLink: ctaLink !== undefined ? ctaLink : undefined,
        imageUrl: imageUrl !== undefined ? imageUrl : undefined,
        displayOrder: displayOrder !== undefined ? parseInt(String(displayOrder), 10) : undefined,
        isActive: isActive !== undefined ? Boolean(isActive) : undefined,
      },
    });

    await prisma.auditLog.create({
      data: {
        userName: session.name,
        action: "UPDATE_BANNER",
        entity: "Banner",
        entityId: banner.id,
        newState: JSON.stringify(banner),
      },
    });

    return NextResponse.json({ success: true, banner });
  } catch (error: any) {
    console.error("[Banner Update Error]", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to update banner" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    await prisma.banner.delete({
      where: { id: params.id },
    });

    await prisma.auditLog.create({
      data: {
        userName: session.name,
        action: "DELETE_BANNER",
        entity: "Banner",
        entityId: params.id,
      },
    });

    return NextResponse.json({ success: true, message: "Banner deleted successfully" });
  } catch (error: any) {
    console.error("[Banner Delete Error]", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to delete banner" },
      { status: 500 }
    );
  }
}
