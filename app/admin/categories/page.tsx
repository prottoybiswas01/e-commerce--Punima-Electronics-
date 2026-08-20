import React from "react";
import prisma from "@/lib/prisma";
import { CategoryManager } from "@/components/admin/category-manager";

export const revalidate = 0;

export default async function AdminCategoriesPage() {
  const categories = await prisma.category.findMany({
    include: {
      _count: { select: { products: true } },
    },
    orderBy: { displayOrder: "asc" },
  });

  return <CategoryManager initialCategories={categories} />;
}
