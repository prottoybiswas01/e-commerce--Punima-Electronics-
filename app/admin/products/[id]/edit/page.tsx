import React from "react";
import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { ProductForm } from "@/components/admin/product-form";

export const revalidate = 0;

interface EditProductPageProps {
  params: {
    id: string;
  };
}

export default async function EditProductPage({ params }: EditProductPageProps) {
  const [product, categories, brands] = await Promise.all([
    prisma.product.findUnique({
      where: { id: params.id },
      include: { images: true, variants: true },
    }),
    prisma.category.findMany({ where: { isActive: true }, orderBy: { name: "asc" } }),
    prisma.brand.findMany({ where: { isActive: true }, orderBy: { name: "asc" } }),
  ]);

  if (!product) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Edit Product: {product.name}
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Update pricing, images, specifications, or stock thresholds.
        </p>
      </div>

      <ProductForm initialData={product} categories={categories} brands={brands} />
    </div>
  );
}
