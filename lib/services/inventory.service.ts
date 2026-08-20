import prisma from "@/lib/prisma";

export async function adjustInventoryStock(params: {
  productId: string;
  variantId?: string | null;
  changeQuantity: number;
  reason: "PURCHASE" | "SALE" | "RETURN" | "DAMAGE" | "MANUAL_ADJUSTMENT" | "CORRECTION" | "RESTOCK";
  notes?: string;
  createdBy?: string;
}) {
  const { productId, variantId, changeQuantity, reason, notes, createdBy = "System" } = params;

  return await prisma.$transaction(async (tx) => {
    let inventory = await tx.inventory.findFirst({
      where: {
        productId,
        variantId: variantId || null,
      },
    });

    if (!inventory) {
      // Find current product stock
      const product = await tx.product.findUnique({ where: { id: productId } });
      const currentStock = product?.stock || 0;
      inventory = await tx.inventory.create({
        data: {
          productId,
          variantId: variantId || null,
          currentStock,
        },
      });
    }

    const previousStock = inventory.currentStock;
    const newStock = previousStock + changeQuantity;

    if (newStock < 0) {
      throw new Error(`Insufficient stock for product. Available: ${previousStock}, Requested change: ${changeQuantity}`);
    }

    // Update inventory record
    const updatedInventory = await tx.inventory.update({
      where: { id: inventory.id },
      data: {
        currentStock: newStock,
        soldQuantity: reason === "SALE" ? { increment: Math.abs(changeQuantity) } : undefined,
        damagedQuantity: reason === "DAMAGE" ? { increment: Math.abs(changeQuantity) } : undefined,
        returnedQuantity: reason === "RETURN" ? { increment: Math.abs(changeQuantity) } : undefined,
      },
    });

    // Update product/variant direct stock field for quick query
    if (variantId) {
      await tx.productVariant.update({
        where: { id: variantId },
        data: { stock: newStock },
      });
    } else {
      await tx.product.update({
        where: { id: productId },
        data: { stock: newStock },
      });
    }

    // Log transaction in the immutable ledger
    await tx.inventoryTransaction.create({
      data: {
        inventoryId: inventory.id,
        productId,
        variantId: variantId || null,
        previousStock,
        changeQuantity,
        newStock,
        reason,
        notes,
        createdBy,
      },
    });

    // Trigger low-stock alert notification if needed
    const product = await tx.product.findUnique({ where: { id: productId } });
    if (product && newStock <= product.lowStockThreshold) {
      await tx.notification.create({
        data: {
          type: newStock === 0 ? "OUT_OF_STOCK" : "LOW_STOCK",
          title: newStock === 0 ? `Out of Stock: ${product.name}` : `Low Stock Alert: ${product.name}`,
          message: `Product stock is now at ${newStock} units (Threshold: ${product.lowStockThreshold}).`,
          link: `/admin/inventory`,
        },
      });
    }

    return updatedInventory;
  });
}
