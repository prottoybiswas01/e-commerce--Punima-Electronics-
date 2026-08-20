"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingBag, Eye } from "lucide-react";
import { useCart } from "./cart-provider";
import { useWishlist } from "./wishlist-provider";
import { PriceDisplay } from "@/components/ui/price-display";
import { StarRating } from "@/components/ui/star-rating";
import { StockStatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";

export interface ProductCardProps {
  product: {
    id: string;
    name: string;
    slug: string;
    sku: string;
    price: number;
    originalPrice?: number | null;
    discount?: number | null;
    stock: number;
    lowStockThreshold?: number;
    rating?: number;
    reviewCount?: number;
    category?: { name: string; slug: string } | null;
    brand?: { name: string; slug: string } | null;
    images?: Array<{ url: string; isPrimary?: boolean }>;
    isFeatured?: boolean;
    isBestSeller?: boolean;
    isNewArrival?: boolean;
  };
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  const primaryImage =
    product.images?.find((img) => img.isPrimary)?.url ||
    product.images?.[0]?.url ||
    "https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=500";

  const isFavorited = isInWishlist(product.id);
  const isOutOfStock = product.stock <= 0;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isOutOfStock) return;

    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      originalPrice: product.originalPrice,
      image: primaryImage,
      sku: product.sku,
      quantity: 1,
      stock: product.stock,
    });
  };

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.preventDefault();
    toggleWishlist({
      productId: product.id,
      name: product.name,
      slug: product.slug,
      price: product.price,
      originalPrice: product.originalPrice,
      image: primaryImage,
      categoryName: product.category?.name,
      stock: product.stock,
    });
  };

  return (
    <div className="group bg-white rounded-xl border border-slate-200/90 shadow-sm hover:shadow-xl hover:border-blue-400/50 transition-all duration-300 flex flex-col overflow-hidden relative">
      {/* Product Image Section */}
      <div className="relative aspect-square w-full bg-slate-50 overflow-hidden">
        <Link href={`/product/${product.slug}`} className="block h-full w-full relative">
          <Image
            src={primaryImage}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </Link>

        {/* Badges Overlay */}
        <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
          {product.isBestSeller && (
            <span className="bg-amber-500 text-slate-950 font-extrabold text-[10px] uppercase px-2 py-0.5 rounded shadow-sm">
              Best Seller
            </span>
          )}
          {product.isNewArrival && (
            <span className="bg-blue-600 text-white font-bold text-[10px] uppercase px-2 py-0.5 rounded shadow-sm">
              New Arrival
            </span>
          )}
          {product.discount && product.discount > 0 && !product.isBestSeller && !product.isNewArrival ? (
            <span className="bg-rose-600 text-white font-bold text-[10px] px-2 py-0.5 rounded shadow-sm">
              {product.discount}% OFF
            </span>
          ) : null}
        </div>

        {/* Wishlist Button */}
        <button
          onClick={handleWishlistClick}
          className="absolute top-2 right-2 h-8 w-8 rounded-full bg-white/90 backdrop-blur-sm shadow-md flex items-center justify-center text-slate-600 hover:text-rose-600 hover:scale-110 transition z-10"
          title={isFavorited ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart
            className={`h-4 w-4 ${
              isFavorited ? "fill-rose-600 text-rose-600" : ""
            }`}
          />
        </button>

        {/* Stock status watermark if out of stock */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-white/70 backdrop-blur-[2px] flex items-center justify-center">
            <span className="bg-red-600 text-white font-bold text-xs uppercase px-3 py-1 rounded shadow">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      {/* Product Details Section */}
      <div className="p-3.5 sm:p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Category & Brand info */}
          <div className="flex justify-between items-center text-[11px] text-slate-400 mb-1">
            <span>{product.category?.name || "Electronics"}</span>
            {product.brand && <span className="font-semibold text-slate-500">{product.brand.name}</span>}
          </div>

          {/* Product Title */}
          <Link
            href={`/product/${product.slug}`}
            className="block text-sm font-semibold text-slate-900 hover:text-blue-600 line-clamp-2 leading-snug transition-colors mb-2"
            title={product.name}
          >
            {product.name}
          </Link>

          {/* Ratings */}
          <div className="mb-2.5">
            <StarRating
              rating={product.rating || 5}
              count={product.reviewCount || 0}
              size="sm"
            />
          </div>
        </div>

        <div>
          {/* Price */}
          <div className="mb-3">
            <PriceDisplay
              price={product.price}
              originalPrice={product.originalPrice}
              discount={product.discount}
              size="md"
            />
          </div>

          {/* Quick Add Button */}
          <Button
            onClick={handleQuickAdd}
            disabled={isOutOfStock}
            className={`w-full text-xs font-semibold h-9 flex items-center justify-center gap-1.5 ${
              isOutOfStock
                ? "bg-slate-200 text-slate-400"
                : "bg-slate-900 hover:bg-blue-600 text-white"
            }`}
          >
            <ShoppingBag className="h-3.5 w-3.5" />
            {isOutOfStock ? "Out of Stock" : "Add to Cart"}
          </Button>
        </div>
      </div>
    </div>
  );
}
