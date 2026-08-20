import React from "react";
import Link from "next/link";
import Image from "next/image";
import prisma from "@/lib/prisma";
import { HeroSlider } from "@/components/store/hero-slider";
import { FlashSaleSection } from "@/components/store/flash-sale-section";
import { ProductCard } from "@/components/store/product-card";
import { StarRating } from "@/components/ui/star-rating";
import {
  Sparkles,
  ArrowRight,
  TrendingUp,
  Award,
  Truck,
  ShieldCheck,
  Headphones,
  CheckCircle2,
  Tv,
  Smartphone,
  Refrigerator,
  Wind,
  Laptop,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export const revalidate = 0; // Dynamic rendering for freshness

export default async function HomePage() {
  const [
    banners,
    categories,
    flashProducts,
    bestSellers,
    newArrivals,
    reviews,
  ] = await Promise.all([
    prisma.banner.findMany({
      where: { isActive: true },
      orderBy: { displayOrder: "asc" },
    }),
    prisma.category.findMany({
      where: { isActive: true, isFeatured: true },
      orderBy: { displayOrder: "asc" },
      take: 6,
    }),
    prisma.product.findMany({
      where: { isActive: true, isArchived: false, discount: { gt: 5 } },
      include: { images: true, category: true, brand: true },
      take: 4,
    }),
    prisma.product.findMany({
      where: { isActive: true, isArchived: false, isBestSeller: true },
      include: { images: true, category: true, brand: true },
      take: 8,
    }),
    prisma.product.findMany({
      where: { isActive: true, isArchived: false, isNewArrival: true },
      include: { images: true, category: true, brand: true },
      take: 8,
    }),
    prisma.review.findMany({
      where: { isApproved: true },
      include: { product: { select: { name: true, slug: true } } },
      take: 3,
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const getCategoryIcon = (slug: string) => {
    switch (slug) {
      case "smart-tvs-audio":
        return <Tv className="h-6 w-6 text-blue-600" />;
      case "smartphones-tablets":
        return <Smartphone className="h-6 w-6 text-rose-600" />;
      case "home-appliances":
        return <Refrigerator className="h-6 w-6 text-emerald-600" />;
      case "air-conditioners":
        return <Wind className="h-6 w-6 text-cyan-600" />;
      case "laptops-computing":
        return <Laptop className="h-6 w-6 text-indigo-600" />;
      default:
        return <Headphones className="h-6 w-6 text-amber-600" />;
    }
  };

  return (
    <div className="container mx-auto px-4 py-4 sm:py-6 space-y-10 sm:space-y-14">
      {/* 1. Hero Banner Slider */}
      <HeroSlider banners={banners} />

      {/* 2. Top Featured Categories */}
      <section>
        <div className="flex justify-between items-end mb-6">
          <div>
            <div className="flex items-center gap-1.5 text-blue-600 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="h-3.5 w-3.5" />
              <span>EXPLORE POPULAR</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1">
              Featured Categories
            </h2>
          </div>
          <Link
            href="/shop"
            className="text-xs sm:text-sm font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            All Categories <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/shop?category=${cat.slug}`}
              className="group bg-white rounded-xl border border-slate-200/90 p-4 flex flex-col items-center text-center hover:border-blue-400 hover:shadow-md transition-all duration-300"
            >
              <div className="h-14 w-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                {getCategoryIcon(cat.slug)}
              </div>
              <h3 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                {cat.name}
              </h3>
              <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">
                Explore Items
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. Flash Sale Section with Countdown */}
      <FlashSaleSection products={flashProducts} />

      {/* 4. Best Sellers Section */}
      <section>
        <div className="flex justify-between items-end mb-6">
          <div>
            <div className="flex items-center gap-1.5 text-amber-600 text-xs font-bold uppercase tracking-wider">
              <TrendingUp className="h-3.5 w-3.5" />
              <span>CUSTOMER FAVORITES</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1">
              Best Selling Electronics
            </h2>
          </div>
          <Link
            href="/shop?sort=best_selling"
            className="text-xs sm:text-sm font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            View All <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {bestSellers.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* 5. Mid-page Promotional Banner */}
      <section className="rounded-2xl overflow-hidden bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 p-8 sm:p-12 text-white shadow-xl relative">
        <div className="max-w-xl space-y-4 relative z-10">
          <span className="bg-rose-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase">
            Official Brand Warranty
          </span>
          <h3 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            Upgrade Your Living Room with 4K Crystal UHD Smart TVs
          </h3>
          <p className="text-slate-200 text-sm sm:text-base">
            Enjoy immersive cinema-quality sound and vivid HDR colors with official installation support across Dhaka.
          </p>
          <div className="pt-2">
            <Button size="lg" className="bg-white text-slate-950 hover:bg-slate-100 font-bold" asChild>
              <Link href="/shop?category=smart-tvs-audio">
                Explore Smart TVs <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* 6. New Arrivals Section */}
      <section>
        <div className="flex justify-between items-end mb-6">
          <div>
            <div className="flex items-center gap-1.5 text-emerald-600 text-xs font-bold uppercase tracking-wider">
              <Award className="h-3.5 w-3.5" />
              <span>JUST LAUNCHED</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1">
              New Arrivals
            </h2>
          </div>
          <Link
            href="/shop?sort=newest"
            className="text-xs sm:text-sm font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            View All <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {newArrivals.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* 7. Customer Reviews Section */}
      <section className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-10 shadow-sm">
        <div className="text-center max-w-xl mx-auto mb-8">
          <div className="inline-flex items-center gap-1.5 text-blue-600 text-xs font-bold uppercase tracking-wider bg-blue-50 px-3 py-1 rounded-full mb-2">
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>REAL BUYER EXPERIENCES</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            What Our Customers Say
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Thousands of satisfied retail customers trust Purnima Electronics for 100% genuine products and reliable service.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {reviews.map((rev) => (
            <div
              key={rev.id}
              className="bg-slate-50/80 rounded-xl p-5 border border-slate-100 flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-center mb-3">
                  <StarRating rating={rev.rating} />
                  <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    Verified Purchase
                  </span>
                </div>
                <h4 className="text-sm font-bold text-slate-900 mb-1.5">
                  {rev.title || "Excellent Quality!"}
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed italic">
                  "{rev.comment}"
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">
                  {rev.customerName}
                </span>
                <span className="text-[10px] text-slate-400">
                  {rev.product.name.slice(0, 24)}...
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 8. Newsletter Subscription */}
      <section className="bg-slate-900 rounded-2xl p-8 text-center text-white space-y-4">
        <h3 className="text-xl sm:text-2xl font-bold">
          Subscribe for Secret Deals & Special Coupons
        </h3>
        <p className="text-slate-300 text-xs sm:text-sm max-w-md mx-auto">
          Get exclusive discounts, new product launch alerts, and voucher codes delivered to your inbox.
        </p>
        <div className="flex flex-col sm:flex-row gap-2 justify-center max-w-md mx-auto pt-2">
          <input
            type="email"
            placeholder="Enter your email address..."
            className="h-10 px-4 rounded-lg bg-slate-800 border border-slate-700 text-white text-xs placeholder:text-slate-400 focus:outline-none focus:border-blue-500 flex-1"
          />
          <Button className="bg-blue-600 hover:bg-blue-700 font-semibold text-xs h-10 px-6">
            Subscribe
          </Button>
        </div>
      </section>
    </div>
  );
}
