import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { productSchema } from "@/lib/validators";
import { getAdminSession } from "@/lib/auth/session";
import { adjustInventoryStock } from "@/lib/services/inventory.service";
import { broadcastNewProductEmail } from "@/lib/email/resend";

export async function POST(req: Request) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const data = productSchema.parse(body);

    const product = await prisma.$transaction(async (tx) => {
      const created = await tx.product.create({
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
          inventory: {
            create: {
              currentStock: data.stock,
            },
          },
        },
      });

      // Record initial inventory log
      const inv = await tx.inventory.findUnique({ where: { productId: created.id } });
      if (inv && data.stock > 0) {
        await tx.inventoryTransaction.create({
          data: {
            inventoryId: inv.id,
            productId: created.id,
            previousStock: 0,
            changeQuantity: data.stock,
            newStock: data.stock,
            reason: "RESTOCK",
            notes: "Initial inventory setup on product creation",
            createdBy: session.name,
          },
        });
      }

      await tx.auditLog.create({
        data: {
          userName: session.name,
          action: "CREATE_PRODUCT",
          entity: "Product",
          entityId: created.id,
          newState: JSON.stringify({ name: created.name, sku: created.sku, price: created.price }),
        },
      });

      return created;
    });

    // Automatically broadcast new product marketing email to registered customers in background
    broadcastNewProductEmail({
      product: {
        ...product,
        images: data.images,
      },
    }).catch((err) => console.error("[Broadcast New Product Email Error]", err));

    return NextResponse.json({ success: true, product });
  } catch (error: any) {
    console.error("[Product Creation Error]", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to create product" },
      { status: 400 }
    );
  }
}
