import React from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { ProductDetailsClient } from "@/components/store/product-details-client";
import { ProductCard } from "@/components/store/product-card";
import { StarRating } from "@/components/ui/star-rating";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle2, ShieldAlert } from "lucide-react";

export const revalidate = 60;

interface ProductPageProps {
  params: {
    slug: string;
  };
}

export async function generateMetadata({ params }: ProductPageProps) {
  const product = await prisma.product.findUnique({
    where: { slug: params.slug },
    select: { name: true, description: true, seoTitle: true, seoDescription: true },
  });

  if (!product) return { title: "Product Not Found | Purnima Electronics" };

  return {
    title: product.seoTitle || `${product.name} | Purnima Electronics`,
    description: product.seoDescription || product.description.slice(0, 160),
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const product = await prisma.product.findUnique({
    where: { slug: params.slug },
    include: {
      images: { orderBy: { displayOrder: "asc" } },
      variants: true,
      category: true,
      brand: true,
      reviews: {
        where: { isApproved: true },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!product) {
    notFound();
  }

  // Related products from the same category
  const relatedProducts = await prisma.product.findMany({
    where: {
      categoryId: product.categoryId,
      id: { not: product.id },
      isActive: true,
      isArchived: false,
    },
    take: 4,
    include: { images: true, category: true, brand: true },
  });

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8 space-y-12">
      {/* Breadcrumb */}
      <nav className="text-xs text-slate-500 font-medium">
        <Link href="/" className="hover:text-blue-600">Home</Link>
        <span className="mx-2">/</span>
        <Link href="/shop" className="hover:text-blue-600">Shop</Link>
        {product.category && (
          <>
            <span className="mx-2">/</span>
            <Link href={`/shop?category=${product.category.slug}`} className="hover:text-blue-600">
              {product.category.name}
            </Link>
          </>
        )}
        <span className="mx-2">/</span>
        <span className="text-slate-900 font-semibold truncate">{product.name}</span>
      </nav>

      {/* Main Product Info Component */}
      <ProductDetailsClient product={product} />

      {/* Tabs for Description, Specifications, and Customer Reviews */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
        <Tabs defaultValue="description" className="w-full">
          <TabsList className="grid w-full grid-cols-3 max-w-md mb-6">
            <TabsTrigger value="description">Description</TabsTrigger>
            <TabsTrigger value="specs">Specifications</TabsTrigger>
            <TabsTrigger value="reviews">Reviews ({product.reviews.length})</TabsTrigger>
          </TabsList>

          {/* Description Tab */}
          <TabsContent value="description" className="space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Product Overview</h3>
            <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
              {product.description}
            </div>
          </TabsContent>

          {/* Specifications Tab */}
          <TabsContent value="specs">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Technical Specifications</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="flex justify-between py-2.5 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Model SKU</span>
                <span className="font-semibold text-slate-800">{product.sku}</span>
              </div>
              <div className="flex justify-between py-2.5 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Brand</span>
                <span className="font-semibold text-slate-800">{product.brand?.name || "Official"}</span>
              </div>
              <div className="flex justify-between py-2.5 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Category</span>
                <span className="font-semibold text-slate-800">{product.category?.name || "Electronics"}</span>
              </div>
              <div className="flex justify-between py-2.5 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Weight</span>
                <span className="font-semibold text-slate-800">{product.weight ? `${product.weight} kg` : "Standard"}</span>
              </div>
              {product.dimensions && (
                <div className="flex justify-between py-2.5 border-b border-slate-100">
                  <span className="text-slate-500 font-medium">Dimensions</span>
                  <span className="font-semibold text-slate-800">{product.dimensions}</span>
                </div>
              )}
              <div className="flex justify-between py-2.5 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Warranty</span>
                <span className="font-semibold text-emerald-700">Official Brand Warranty</span>
              </div>
            </div>
          </TabsContent>

          {/* Reviews Tab */}
          <TabsContent value="reviews" className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Customer Reviews</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Verified feedback from actual customers who purchased this item.
                </p>
              </div>
            </div>

            {product.reviews.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-sm">
                No reviews yet for this product. Be the first to review after ordering!
              </div>
            ) : (
              <div className="space-y-4">
                {product.reviews.map((rev) => (
                  <div key={rev.id} className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="font-bold text-sm text-slate-900 flex items-center gap-2">
                          <span>{rev.customerName}</span>
                          {rev.isVerifiedPurchase && (
                            <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-semibold border border-emerald-200">
                              Verified Purchase
                            </span>
                          )}
                        </div>
                        <div className="mt-1">
                          <StarRating rating={rev.rating} size="sm" />
                        </div>
                      </div>
                      <span className="text-[11px] text-slate-400">
                        {new Date(rev.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    {rev.title && <h4 className="text-xs font-bold text-slate-800 mb-1">{rev.title}</h4>}
                    <p className="text-xs text-slate-600 leading-relaxed">{rev.comment}</p>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Related Products Grid */}
      {relatedProducts.length > 0 && (
        <section className="pt-4">
          <h2 className="text-xl font-extrabold text-slate-900 mb-6">
            Related Electronics You May Like
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
