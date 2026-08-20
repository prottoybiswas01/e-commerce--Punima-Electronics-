import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { slugify } from "@/lib/utils";
import { getAdminSession } from "@/lib/auth/session";

export async function GET() {
  try {
    const brands = await prisma.brand.findMany({
      include: {
        _count: { select: { products: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ success: true, brands });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { name, logo, description, isFeatured } = await req.json();

    if (!name || !name.trim()) {
      return NextResponse.json(
        { success: false, message: "Brand name is required" },
        { status: 400 }
      );
    }

    const cleanName = name.trim();
    const slug = slugify(cleanName);

    // Check if brand slug exists
    const existing = await prisma.brand.findUnique({
      where: { slug },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, message: "A brand with this name already exists" },
        { status: 400 }
      );
    }

    const brand = await prisma.brand.create({
      data: {
        name: cleanName,
        slug,
        logo: logo || null,
        description: description || null,
        isFeatured: Boolean(isFeatured),
        isActive: true,
      },
    });

    await prisma.auditLog.create({
      data: {
        userName: session.name,
        action: "CREATE_BRAND",
        entity: "Brand",
        entityId: brand.id,
        newState: JSON.stringify(brand),
      },
    });

    return NextResponse.json({ success: true, brand });
  } catch (error: any) {
    console.error("[Brand Create Error]", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to create brand" },
      { status: 500 }
    );
  }
}
