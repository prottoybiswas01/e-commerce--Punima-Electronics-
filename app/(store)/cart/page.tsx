"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/components/store/cart-provider";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Tag,
  Check,
} from "lucide-react";
import { toast } from "sonner";

export default function CartPage() {
  const {
    items,
    removeItem,
    updateQuantity,
    subtotal,
    couponCode,
    setCouponCode,
    couponDiscount,
    setCouponDiscount,
  } = useCart();

  const [couponInput, setCouponInput] = useState(couponCode || "");
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(couponCode || null);

  const freeShippingThreshold = 5000;
  const progressToFreeShipping = Math.min(100, (subtotal / freeShippingThreshold) * 100);
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);

  const estimatedDelivery = subtotal >= freeShippingThreshold ? 0 : 70;
  const grandTotal = Math.max(0, subtotal - couponDiscount + estimatedDelivery);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;

    setIsValidatingCoupon(true);
    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponInput.trim(), subtotal }),
      });

      const data = await res.json();
      if (!res.ok || !data.isValid) {
        toast.error(data.message || "Invalid coupon code");
        setCouponDiscount(0);
        setAppliedCoupon(null);
      } else {
        setCouponDiscount(data.discountAmount);
        setCouponCode(couponInput.trim().toUpperCase());
        setAppliedCoupon(couponInput.trim().toUpperCase());
        toast.success(`Coupon applied! You saved ৳${data.discountAmount}`);
      }
    } catch (error) {
      toast.error("Failed to validate coupon");
    } finally {
      setIsValidatingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setCouponCode("");
    setCouponDiscount(0);
    setAppliedCoupon(null);
    setCouponInput("");
    toast.info("Coupon removed");
  };

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center max-w-md">
        <div className="h-20 w-20 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <ShoppingBag className="h-10 w-10" />
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900">Your Cart is Empty</h1>
        <p className="text-sm text-slate-500 mt-2">
          Looks like you haven't added any electronics to your shopping bag yet.
        </p>
        <Button size="lg" className="mt-6 bg-blue-600 hover:bg-blue-700" asChild>
          <Link href="/shop">Start Shopping</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8 space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Shopping Cart ({items.length} {items.length === 1 ? "item" : "items"})
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Review your items and proceed to fast checkout.
        </p>
      </div>

      {/* Free Shipping Progress Indicator */}
      <div className="bg-blue-50/80 border border-blue-200 rounded-xl p-4">
        <div className="flex justify-between items-center text-xs font-semibold text-blue-900 mb-1.5">
          <span className="flex items-center gap-1.5">
            <Sparkles className="h-4 w-4 text-blue-600" />
            {remainingForFreeShipping === 0
              ? "🎉 You have unlocked Free Nationwide Delivery!"
              : `Add ${formatPrice(remainingForFreeShipping)} more to get FREE Delivery!`}
          </span>
          <span>{Math.round(progressToFreeShipping)}%</span>
        </div>
        <div className="w-full h-2 bg-blue-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-600 rounded-full transition-all duration-500"
            style={{ width: `${progressToFreeShipping}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Cart Table */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden divide-y divide-slate-100">
            {items.map((item) => (
              <div key={item.id} className="p-4 sm:p-5 flex gap-4 items-center">
                {/* Product Image */}
                <div className="relative h-20 w-20 sm:h-24 sm:w-24 rounded-lg overflow-hidden bg-slate-50 border border-slate-200 shrink-0">
                  <Image
                    src={item.image || "https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=200"}
                    alt={item.name}
                    fill
                    className="object-cover"
                  />
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <h3 className="text-sm sm:text-base font-bold text-slate-900 line-clamp-1">
                        {item.name}
                      </h3>
                      {item.variantName && (
                        <p className="text-xs text-slate-500 font-medium mt-0.5">
                          Variant: {item.variantName}
                        </p>
                      )}
                      <p className="text-xs text-slate-400 font-mono mt-0.5">
                        SKU: {item.sku}
                      </p>
                    </div>

                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-slate-400 hover:text-red-500 p-1 transition"
                      title="Remove Item"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="flex justify-between items-center mt-3 flex-wrap gap-2">
                    {/* Quantity Selector */}
                    <div className="flex items-center border border-slate-300 rounded-lg bg-white">
                      <button
                        onClick={() => updateQuantity(item.id, -1)}
                        className="px-2.5 py-1 text-slate-600 hover:bg-slate-100 text-xs"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="px-3 text-xs font-bold text-slate-900">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, 1)}
                        className="px-2.5 py-1 text-slate-600 hover:bg-slate-100 text-xs"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    {/* Pricing */}
                    <div className="text-right">
                      <div className="text-base font-extrabold text-slate-900">
                        {formatPrice(item.price * item.quantity)}
                      </div>
                      {item.quantity > 1 && (
                        <div className="text-[11px] text-slate-400">
                          {formatPrice(item.price)} each
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center pt-2">
            <Button variant="outline" size="sm" asChild>
              <Link href="/shop">← Continue Shopping</Link>
            </Button>
          </div>
        </div>

        {/* Right Col: Order Summary & Coupon */}
        <div className="space-y-6">
          {/* Coupon Box */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-3">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Tag className="h-4 w-4 text-blue-600" /> Apply Promo Code / Voucher
            </h4>

            {appliedCoupon ? (
              <div className="flex items-center justify-between p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
                <span className="flex items-center gap-1.5">
                  <Check className="h-4 w-4 text-emerald-600" />
                  {appliedCoupon} (-{formatPrice(couponDiscount)})
                </span>
                <button
                  onClick={handleRemoveCoupon}
                  className="text-red-600 hover:underline font-semibold"
                >
                  Remove
                </button>
              </div>
            ) : (
              <form onSubmit={handleApplyCoupon} className="flex gap-2">
                <Input
                  placeholder="e.g. WELCOME10, SAVE500"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                  className="uppercase text-xs"
                />
                <Button
                  type="submit"
                  size="sm"
                  disabled={isValidatingCoupon || !couponInput.trim()}
                  className="bg-slate-900 hover:bg-blue-600 text-xs px-4"
                >
                  {isValidatingCoupon ? "Checking..." : "Apply"}
                </Button>
              </form>
            )}
          </div>

          {/* Price Breakdown Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
            <h4 className="text-sm font-bold text-slate-900 pb-3 border-b border-slate-100">
              Order Summary
            </h4>

            <div className="space-y-2.5 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-semibold text-slate-900">{formatPrice(subtotal)}</span>
              </div>

              {couponDiscount > 0 && (
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>Coupon Discount</span>
                  <span>-{formatPrice(couponDiscount)}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>Estimated Delivery (Inside Dhaka)</span>
                <span className="font-semibold text-slate-900">
                  {estimatedDelivery === 0 ? "FREE" : formatPrice(estimatedDelivery)}
                </span>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-between items-baseline">
                <span className="text-sm font-bold text-slate-900">Estimated Total</span>
                <span className="text-xl font-extrabold text-blue-600">
                  {formatPrice(grandTotal)}
                </span>
              </div>
            </div>

            <Button
              size="lg"
              className="w-full bg-blue-600 hover:bg-blue-700 font-bold text-sm h-12 flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30"
              asChild
            >
              <Link href="/checkout">
                Proceed to Checkout <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>

            <div className="pt-2 text-center flex items-center justify-center gap-1 text-[11px] text-slate-500">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
              <span>Safe & Secure Cash on Delivery available</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
