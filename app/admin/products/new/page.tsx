import React from "react";
import prisma from "@/lib/prisma";
import { ProductForm } from "@/components/admin/product-form";

export const revalidate = 0;

export default async function NewProductPage() {
  const [categories, brands] = await Promise.all([
    prisma.category.findMany({ where: { isActive: true }, orderBy: { name: "asc" } }),
    prisma.brand.findMany({ where: { isActive: true }, orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Create New Product
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Add an authentic electronics item with images, specifications, price, and stock levels.
        </p>
      </div>

      <ProductForm categories={categories} brands={brands} />
    </div>
  );
}
