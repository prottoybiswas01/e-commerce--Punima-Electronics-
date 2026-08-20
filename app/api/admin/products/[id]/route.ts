import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { productSchema } from "@/lib/validators";
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

    const body = await req.json();
    const data = productSchema.parse(body);

    const updated = await prisma.$transaction(async (tx) => {
      // Delete old images & recreate
      await tx.productImage.deleteMany({ where: { productId: params.id } });

      const prod = await tx.product.update({
        where: { id: params.id },
        data: {
          name: data.name,
          slug: data.slug,
          sku: data.sku,
          categoryId: data.categoryId,
          brandId: data.brandId || null,
          description: data.description,
          shortDescription: data.shortDescription || null,
          price: data.price,
          originalPrice: data.originalPrice || null,
          discount: data.discount || 0,
          costPrice: data.costPrice || 0,
          stock: data.stock,
          lowStockThreshold: data.lowStockThreshold || 5,
          weight: data.weight || 0.5,
          dimensions: data.dimensions || null,
          tags: data.tags || null,
          isFeatured: data.isFeatured || false,
          isBestSeller: data.isBestSeller || false,
          isNewArrival: data.isNewArrival || false,
          isActive: data.isActive !== false,
          seoTitle: data.seoTitle || null,
          seoDescription: data.seoDescription || null,
          images: {
            create: data.images.map((img, idx) => ({
              url: img.url,
              altText: img.altText || data.name,
              isPrimary: idx === 0 || img.isPrimary,
              displayOrder: idx,
            })),
          },
        },
      });

      // Update inventory table currentStock
      await tx.inventory.upsert({
        where: { productId: params.id },
        create: { productId: params.id, currentStock: data.stock },
        update: { currentStock: data.stock },
      });

      await tx.auditLog.create({
        data: {
          userName: session.name,
          action: "UPDATE_PRODUCT",
          entity: "Product",
          entityId: prod.id,
          newState: JSON.stringify({ name: prod.name, price: prod.price, stock: prod.stock }),
        },
      });

      return prod;
    });

    return NextResponse.json({ success: true, product: updated });
  } catch (error: any) {
    console.error("[Product Update Error]", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to update product" },
      { status: 400 }
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

    await prisma.product.update({
      where: { id: params.id },
      data: { isArchived: true, isActive: false },
    });

    await prisma.auditLog.create({
      data: {
        userName: session.name,
        action: "ARCHIVE_PRODUCT",
        entity: "Product",
        entityId: params.id,
      },
    });

    return NextResponse.json({ success: true, message: "Product archived successfully" });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to delete product" },
      { status: 500 }
    );
  }
}
