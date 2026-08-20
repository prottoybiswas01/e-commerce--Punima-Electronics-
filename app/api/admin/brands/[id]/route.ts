import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { slugify } from "@/lib/utils";
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

    const { name, logo, description, isFeatured, isActive } = await req.json();

    const brand = await prisma.brand.update({
      where: { id: params.id },
      data: {
        name: name || undefined,
        slug: name ? slugify(name) : undefined,
        logo: logo !== undefined ? logo : undefined,
        description: description !== undefined ? description : undefined,
        isFeatured: isFeatured !== undefined ? Boolean(isFeatured) : undefined,
        isActive: isActive !== undefined ? Boolean(isActive) : undefined,
      },
    });

    await prisma.auditLog.create({
      data: {
        userName: session.name,
        action: "UPDATE_BRAND",
        entity: "Brand",
        entityId: brand.id,
        newState: JSON.stringify(brand),
      },
    });

    return NextResponse.json({ success: true, brand });
  } catch (error: any) {
    console.error("[Brand Update Error]", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to update brand" },
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

    // Check if brand has products
    const productCount = await prisma.product.count({
      where: { brandId: params.id },
    });

    if (productCount > 0) {
      // Unlink products from brand
      await prisma.product.updateMany({
        where: { brandId: params.id },
        data: { brandId: null },
      });
    }

    await prisma.brand.delete({
      where: { id: params.id },
    });

    await prisma.auditLog.create({
      data: {
        userName: session.name,
        action: "DELETE_BRAND",
        entity: "Brand",
        entityId: params.id,
      },
    });

    return NextResponse.json({ success: true, message: "Brand deleted successfully" });
  } catch (error: any) {
    console.error("[Brand Delete Error]", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to delete brand" },
      { status: 500 }
    );
  }
}
