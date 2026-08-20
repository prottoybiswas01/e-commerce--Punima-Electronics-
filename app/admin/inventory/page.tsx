import React from "react";
import prisma from "@/lib/prisma";
import { InventoryClient } from "@/components/admin/inventory-client";

export const revalidate = 0;

export default async function AdminInventoryPage() {
  const [products, transactions] = await Promise.all([
    prisma.product.findMany({
      where: { isArchived: false },
      include: { images: true, category: true, inventory: true },
      orderBy: { stock: "asc" },
    }),
    prisma.inventoryTransaction.findMany({
      take: 50,
      orderBy: { createdAt: "desc" },
      include: {
        inventory: {
          include: { product: true },
        },
      },
    }),
  ]);

  return <InventoryClient products={products} transactions={transactions} />;
}
