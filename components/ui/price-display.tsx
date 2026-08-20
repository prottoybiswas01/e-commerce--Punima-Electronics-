import React from "react";
import { formatPrice } from "@/lib/utils";

export function PriceDisplay({
  price,
  originalPrice,
  discount,
  size = "md",
}: {
  price: number;
  originalPrice?: number | null;
  discount?: number | null;
  size?: "sm" | "md" | "lg" | "xl";
}) {
  const sizeClasses = {
    sm: "text-sm font-semibold",
    md: "text-base font-bold",
    lg: "text-xl font-bold",
    xl: "text-2xl sm:text-3xl font-extrabold",
  };

  const hasDiscount = originalPrice && originalPrice > price;

  return (
    <div className="flex items-baseline gap-2 flex-wrap">
      <span className={`${sizeClasses[size]} text-slate-900`}>
        {formatPrice(price)}
      </span>
      {hasDiscount && (
        <span className="text-xs sm:text-sm text-slate-400 line-through font-normal">
          {formatPrice(originalPrice)}
        </span>
      )}
      {discount && discount > 0 ? (
        <span className="text-xs font-semibold px-1.5 py-0.5 rounded bg-rose-100 text-rose-700">
          -{discount}%
        </span>
      ) : null}
    </div>
  );
}
