"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "./cart-provider";
import { useWishlist } from "./wishlist-provider";
import { ProductGallery } from "./product-gallery";
import { PriceDisplay } from "@/components/ui/price-display";
import { StarRating } from "@/components/ui/star-rating";
import { StockStatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import {
  ShoppingBag,
  Zap,
  Heart,
  Truck,
  ShieldCheck,
  RotateCcw,
  Check,
  Plus,
  Minus,
  Share2,
} from "lucide-react";
import { toast } from "sonner";

interface ProductDetailsClientProps {
  product: {
    id: string;
    name: string;
    slug: string;
    sku: string;
    description: string;
    shortDescription?: string | null;
    price: number;
    originalPrice?: number | null;
    discount?: number | null;
    stock: number;
    lowStockThreshold: number;
    weight?: number | null;
    dimensions?: string | null;
    tags?: string | null;
    rating: number;
    reviewCount: number;
    category?: { name: string; slug: string } | null;
    brand?: { name: string; slug: string } | null;
    images: Array<{ url: string; altText?: string | null; isPrimary: boolean }>;
    variants: Array<{
      id: string;
      name: string;
      sku: string;
      price: number;
      originalPrice?: number | null;
      stock: number;
      attributesJson?: string | null;
    }>;
  };
}

export function ProductDetailsClient({ product }: ProductDetailsClientProps) {
  const router = useRouter();
  const { addItem } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  const [selectedVariant, setSelectedVariant] = useState<any | null>(
    product.variants.length > 0 ? product.variants[0] : null
  );
  const [quantity, setQuantity] = useState(1);

  const currentPrice = selectedVariant ? selectedVariant.price : product.price;
  const currentOriginalPrice = selectedVariant ? selectedVariant.originalPrice : product.originalPrice;
  const currentStock = selectedVariant ? selectedVariant.stock : product.stock;
  const currentSku = selectedVariant ? selectedVariant.sku : product.sku;

  const isOutOfStock = currentStock <= 0;
  const isFavorited = isInWishlist(product.id);

  const primaryImage =
    product.images.find((i) => i.isPrimary)?.url ||
    product.images[0]?.url ||
    "https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=800";

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    addItem({
      productId: product.id,
      variantId: selectedVariant?.id || null,
      name: product.name,
      variantName: selectedVariant?.name || null,
      price: currentPrice,
      originalPrice: currentOriginalPrice,
      image: primaryImage,
      sku: currentSku,
      quantity,
      stock: currentStock,
    });
  };

  const handleBuyNow = () => {
    if (isOutOfStock) return;
    handleAddToCart();
    router.push("/checkout");
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product.name,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Product link copied to clipboard!");
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
      {/* Left Column: Image Gallery */}
      <div>
        <ProductGallery images={product.images} productName={product.name} />
      </div>

      {/* Right Column: Product Purchasing Card */}
      <div className="space-y-6">
        {/* Category, Brand, Sku */}
        <div className="flex items-center justify-between gap-2 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded">
              {product.category?.name || "Electronics"}
            </span>
            {product.brand && (
              <span className="font-bold text-slate-700">
                Brand: {product.brand.name}
              </span>
            )}
          </div>
          <span className="font-mono text-slate-400">SKU: {currentSku}</span>
        </div>

        {/* Product Title */}
        <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
          {product.name}
        </h1>

        {/* Ratings & Stock Status */}
        <div className="flex items-center gap-4 flex-wrap pb-4 border-b border-slate-200">
          <StarRating rating={product.rating} count={product.reviewCount} size="md" />
          <span className="text-slate-300">|</span>
          <StockStatusBadge stock={currentStock} lowThreshold={product.lowStockThreshold} />
        </div>

        {/* Price Box */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80">
          <div className="text-xs text-slate-500 font-medium mb-1">Special Price:</div>
          <PriceDisplay
            price={currentPrice}
            originalPrice={currentOriginalPrice}
            discount={product.discount}
            size="xl"
          />
          <div className="text-[11px] text-emerald-700 font-medium mt-1 flex items-center gap-1">
            <Check className="h-3.5 w-3.5" /> Inclusive of all taxes. Free delivery on orders over ৳5,000.
          </div>
        </div>

        {/* Short Description */}
        {product.shortDescription && (
          <p className="text-sm text-slate-600 leading-relaxed">
            {product.shortDescription}
          </p>
        )}

        {/* Variants Selector (e.g. Storage / Color / Size) */}
        {product.variants.length > 0 && (
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Select Variant:
            </label>
            <div className="flex flex-wrap gap-2">
              {product.variants.map((variant) => {
                const isSelected = selectedVariant?.id === variant.id;
                return (
                  <button
                    key={variant.id}
                    onClick={() => {
                      setSelectedVariant(variant);
                      setQuantity(1);
                    }}
                    className={`px-3 py-2 rounded-lg text-xs font-semibold border transition ${
                      isSelected
                        ? "border-blue-600 bg-blue-50 text-blue-700 ring-2 ring-blue-600/20"
                        : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    {variant.name}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Quantity Selector & Action Buttons */}
        <div className="space-y-4 pt-2">
          <div className="flex items-center gap-4">
            <div className="text-xs font-bold text-slate-800">Quantity:</div>
            <div className="flex items-center border border-slate-300 rounded-lg bg-white overflow-hidden shadow-sm">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                disabled={quantity <= 1 || isOutOfStock}
                className="px-3 py-2 text-slate-600 hover:bg-slate-100 disabled:opacity-40"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="px-4 text-sm font-bold text-slate-900">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity((q) => Math.min(currentStock, q + 1))}
                disabled={quantity >= currentStock || isOutOfStock}
                className="px-3 py-2 text-slate-600 hover:bg-slate-100 disabled:opacity-40"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <span className="text-xs text-slate-500 font-medium">
              {currentStock} units available
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <Button
              size="lg"
              disabled={isOutOfStock}
              onClick={handleAddToCart}
              className="bg-slate-900 hover:bg-slate-800 text-white font-bold h-12 flex items-center justify-center gap-2 shadow"
            >
              <ShoppingBag className="h-5 w-5" />
              {isOutOfStock ? "Out of Stock" : "Add to Cart"}
            </Button>

            <Button
              size="lg"
              disabled={isOutOfStock}
              onClick={handleBuyNow}
              className="bg-rose-600 hover:bg-rose-700 text-white font-bold h-12 flex items-center justify-center gap-2 shadow-lg shadow-rose-600/30"
            >
              <Zap className="h-5 w-5" /> Buy Now
            </Button>
          </div>

          <div className="flex items-center gap-3 pt-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                toggleWishlist({
                  productId: product.id,
                  name: product.name,
                  slug: product.slug,
                  price: currentPrice,
                  originalPrice: currentOriginalPrice,
                  image: primaryImage,
                  stock: currentStock,
                })
              }
              className="flex-1 text-xs font-semibold text-slate-700 hover:text-rose-600"
            >
              <Heart
                className={`h-4 w-4 mr-1.5 ${
                  isFavorited ? "fill-rose-600 text-rose-600" : ""
                }`}
              />
              {isFavorited ? "In Wishlist" : "Add to Wishlist"}
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleShare}
              className="text-xs font-semibold text-slate-700"
            >
              <Share2 className="h-4 w-4 mr-1.5" /> Share
            </Button>
          </div>
        </div>

        {/* Value Prop Badges */}
        <div className="grid grid-cols-3 gap-2 pt-4 border-t border-slate-200 text-center">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <Truck className="h-5 w-5 text-blue-600 mx-auto mb-1" />
            <div className="text-[11px] font-bold text-slate-900">Pathao Delivery</div>
            <div className="text-[10px] text-slate-500">24-48 Hours</div>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <ShieldCheck className="h-5 w-5 text-emerald-600 mx-auto mb-1" />
            <div className="text-[11px] font-bold text-slate-900">Brand Warranty</div>
            <div className="text-[10px] text-slate-500">100% Genuine</div>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <RotateCcw className="h-5 w-5 text-purple-600 mx-auto mb-1" />
            <div className="text-[11px] font-bold text-slate-900">7 Days Return</div>
            <div className="text-[10px] text-slate-500">Easy Replacement</div>
          </div>
        </div>
      </div>
    </div>
  );
}
