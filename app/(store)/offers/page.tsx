import React from "react";
import prisma from "@/lib/prisma";
import { ProductCard } from "@/components/store/product-card";
import { Sparkles, Flame, Tag, Percent } from "lucide-react";
import { formatPrice } from "@/lib/utils";

export const revalidate = 0;

export default async function OffersPage() {
  const [coupons, discountedProducts] = await Promise.all([
    prisma.coupon.findMany({ where: { isActive: true } }),
    prisma.product.findMany({
      where: { isActive: true, isArchived: false, discount: { gt: 0 } },
      include: { images: true, category: true, brand: true },
      orderBy: { discount: "desc" },
    }),
  ]);

  return (
    <div className="container mx-auto px-4 py-8 sm:py-10 space-y-10">
      {/* Offers Banner */}
      <div className="bg-gradient-to-r from-rose-900 via-purple-950 to-slate-900 rounded-2xl p-8 text-white shadow-xl">
        <div className="max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-600 text-white text-xs font-bold w-fit">
            <Flame className="h-4 w-4" />
            <span>EXCLUSIVE DISCOUNT HUB 2026</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Special Deals, Coupons & Discounts
          </h1>
          <p className="text-sm text-slate-300">
            Grab official vouchers and save big on authentic 4K Smart TVs, smartphones, inverter split ACs, and home appliances.
          </p>
        </div>
      </div>

      {/* Active Coupon Vouchers Grid */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <Tag className="h-5 w-5 text-rose-600" /> Active Voucher Codes
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {coupons.map((coupon) => (
            <div
              key={coupon.id}
              className="bg-white rounded-xl border-2 border-dashed border-rose-300 p-5 shadow-sm space-y-3 relative overflow-hidden"
            >
              <div className="flex justify-between items-start">
                <span className="bg-rose-100 text-rose-700 font-mono text-base font-extrabold px-3 py-1 rounded-lg border border-rose-300">
                  {coupon.code}
                </span>
                <Percent className="h-5 w-5 text-rose-500" />
              </div>

              <div>
                <h4 className="font-bold text-slate-900 text-sm">
                  {coupon.type === "PERCENTAGE"
                    ? `${coupon.value}% Instant Discount`
                    : coupon.type === "FREE_SHIPPING"
                    ? "Free Nationwide Delivery"
                    : `৳${coupon.value} Flat Off`}
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Min. spend: {formatPrice(coupon.minOrderAmount)}
                </p>
              </div>

              <div className="text-[11px] text-slate-400 border-t pt-2">
                Use this code at checkout to claim discount.
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Discounted Products Grid */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-amber-500" /> Discounted Electronics
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {discountedProducts.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>
    </div>
  );
}
