"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useWishlist } from "@/components/store/wishlist-provider";
import { useCart } from "@/components/store/cart-provider";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Heart, ShoppingBag, Trash2, ArrowRight } from "lucide-react";

export default function WishlistPage() {
  const { items, removeFromWishlist } = useWishlist();
  const { addItem } = useCart();

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center max-w-md">
        <div className="h-20 w-20 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <Heart className="h-10 w-10" />
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900">Your Wishlist is Empty</h1>
        <p className="text-sm text-slate-500 mt-2">
          Save your favorite smart TVs, phones, and appliances here to buy later.
        </p>
        <Button size="lg" className="mt-6 bg-blue-600 hover:bg-blue-700" asChild>
          <Link href="/shop">Discover Products</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8 space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          My Wishlist ({items.length})
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Items you have saved for future purchases.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {items.map((item) => (
          <div
            key={item.productId}
            className="bg-white rounded-xl border border-slate-200 p-4 flex flex-col justify-between shadow-sm hover:shadow-md transition"
          >
            <div>
              <div className="relative aspect-square w-full rounded-lg overflow-hidden bg-slate-50 border border-slate-100 mb-3">
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  className="object-cover"
                />
                <button
                  onClick={() => removeFromWishlist(item.productId)}
                  className="absolute top-2 right-2 h-7 w-7 rounded-full bg-white/90 shadow text-slate-400 hover:text-red-500 flex items-center justify-center transition"
                  title="Remove"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>

              {item.categoryName && (
                <span className="text-[11px] text-slate-400 font-medium">
                  {item.categoryName}
                </span>
              )}

              <Link
                href={`/product/${item.slug}`}
                className="block text-sm font-bold text-slate-900 hover:text-blue-600 line-clamp-2 mt-1 mb-2"
              >
                {item.name}
              </Link>

              <div className="text-base font-extrabold text-slate-900 mb-3">
                {formatPrice(item.price)}
              </div>
            </div>

            <Button
              size="sm"
              onClick={() => {
                addItem({
                  productId: item.productId,
                  name: item.name,
                  price: item.price,
                  originalPrice: item.originalPrice,
                  image: item.image,
                  sku: "SKU-WISHLIST",
                  quantity: 1,
                  stock: item.stock || 10,
                });
                removeFromWishlist(item.productId);
              }}
              className="w-full bg-blue-600 hover:bg-blue-700 font-semibold text-xs flex items-center justify-center gap-1.5"
            >
              <ShoppingBag className="h-3.5 w-3.5" /> Move to Cart
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
