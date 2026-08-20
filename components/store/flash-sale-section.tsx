"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Zap, Clock, ArrowRight } from "lucide-react";
import { ProductCard } from "./product-card";

export function FlashSaleSection({ products = [] }: { products: any[] }) {
  const [timeLeft, setTimeLeft] = useState({
    hours: 14,
    minutes: 32,
    seconds: 45,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: 59, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return { hours: 23, minutes: 59, seconds: 59 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  if (!products || products.length === 0) return null;

  return (
    <section className="bg-gradient-to-r from-rose-950 via-slate-900 to-indigo-950 rounded-2xl p-6 sm:p-8 text-white shadow-xl border border-rose-500/20 my-8">
      {/* Header with Countdown */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-rose-600 flex items-center justify-center text-white shadow-lg animate-bounce">
            <Zap className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                FLASH SALE DEALS
              </h2>
              <span className="bg-rose-500 text-white text-xs font-bold px-2 py-0.5 rounded-full animate-pulse">
                LIVE
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-300">
              Limited time special prices on top flagship electronics
            </p>
          </div>
        </div>

        {/* Live Timer Boxes */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <div className="flex items-center gap-1 text-slate-400 text-xs font-semibold mr-1">
            <Clock className="h-4 w-4 text-rose-400" />
            <span className="hidden sm:inline">ENDS IN:</span>
          </div>

          <div className="flex items-center gap-1 font-mono text-sm font-bold">
            <div className="bg-rose-900/80 border border-rose-500/40 px-2.5 py-1.5 rounded-lg text-center min-w-[36px]">
              {String(timeLeft.hours).padStart(2, "0")}
            </div>
            <span className="text-rose-400 font-bold">:</span>
            <div className="bg-rose-900/80 border border-rose-500/40 px-2.5 py-1.5 rounded-lg text-center min-w-[36px]">
              {String(timeLeft.minutes).padStart(2, "0")}
            </div>
            <span className="text-rose-400 font-bold">:</span>
            <div className="bg-rose-900/80 border border-rose-500/40 px-2.5 py-1.5 rounded-lg text-center min-w-[36px]">
              {String(timeLeft.seconds).padStart(2, "0")}
            </div>
          </div>

          <Link
            href="/shop?sort=discount_high"
            className="ml-3 text-xs font-bold text-rose-300 hover:text-white flex items-center gap-1 hidden md:flex"
          >
            See All <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      {/* Flash Sale Product Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 pt-6">
        {products.slice(0, 4).map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
