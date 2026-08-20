import React from "react";
import prisma from "@/lib/prisma";
import { ProductListClient } from "@/components/admin/product-list-client";

export const revalidate = 0;

interface AdminProductsPageProps {
  searchParams: {
    search?: string;
    category?: string;
    page?: string;
  };
}

export default async function AdminProductsPage({ searchParams }: AdminProductsPageProps) {
  const { search, category, page = "1" } = searchParams;
  const pageSize = 15;
  const currentPage = parseInt(page, 10) || 1;

  const where: any = { isArchived: false };

  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { sku: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
    ];
  }

  if (category) {
    where.categoryId = category;
  }

  const [products, totalCount, categories] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (currentPage - 1) * pageSize,
      take: pageSize,
      include: { images: true, category: true, brand: true },
    }),
    prisma.product.count({ where }),
    prisma.category.findMany({ where: { isActive: true }, orderBy: { name: "asc" } }),
  ]);

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <ProductListClient
      products={products}
      totalCount={totalCount}
      categories={categories}
      currentPage={currentPage}
      totalPages={totalPages}
      search={search}
      category={category}
    />
  );
}
