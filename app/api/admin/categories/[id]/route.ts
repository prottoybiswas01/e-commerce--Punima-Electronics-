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

    const { name, description, image, icon, isFeatured, displayOrder } = await req.json();

    const category = await prisma.category.update({
      where: { id: params.id },
      data: {
        name: name || undefined,
        slug: name ? slugify(name) : undefined,
        description: description !== undefined ? description : undefined,
        image: image !== undefined ? image : undefined,
        icon: icon !== undefined ? icon : undefined,
        isFeatured: isFeatured !== undefined ? Boolean(isFeatured) : undefined,
        displayOrder: displayOrder !== undefined ? parseInt(String(displayOrder), 10) : undefined,
      },
    });

    await prisma.auditLog.create({
      data: {
        userName: session.name,
        action: "UPDATE_CATEGORY",
        entity: "Category",
        entityId: category.id,
        newState: JSON.stringify(category),
      },
    });

    return NextResponse.json({ success: true, category });
  } catch (error: any) {
    console.error("[Category Update Error]", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to update category" },
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

    // Check if category has products
    const productCount = await prisma.product.count({
      where: { categoryId: params.id },
    });

    if (productCount > 0) {
      return NextResponse.json(
        {
          success: false,
          message: `Cannot delete category because it contains ${productCount} products. Please reassign or delete the products first.`,
        },
        { status: 400 }
      );
    }

    await prisma.category.delete({
      where: { id: params.id },
    });

    await prisma.auditLog.create({
      data: {
        userName: session.name,
        action: "DELETE_CATEGORY",
        entity: "Category",
        entityId: params.id,
      },
    });

    return NextResponse.json({ success: true, message: "Category deleted successfully" });
  } catch (error: any) {
    console.error("[Category Delete Error]", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to delete category" },
      { status: 500 }
    );
  }
}
