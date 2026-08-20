import React from "react";
import prisma from "@/lib/prisma";
import { BrandManager } from "@/components/admin/brand-manager";

export const revalidate = 0;

export default async function AdminBrandsPage() {
  const brands = await prisma.brand.findMany({
    include: {
      _count: { select: { products: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return <BrandManager initialBrands={brands} />;
}
