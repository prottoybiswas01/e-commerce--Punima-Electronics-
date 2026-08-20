"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface BannerItem {
  id: string;
  title: string;
  subtitle?: string | null;
  ctaText?: string | null;
  ctaLink: string;
  imageUrl: string;
}

export function HeroSlider({ banners = [] }: { banners: BannerItem[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [banners.length]);

  if (banners.length === 0) return null;

  const current = banners[currentIndex];

  return (
    <div className="relative w-full h-[320px] sm:h-[420px] md:h-[480px] rounded-2xl overflow-hidden shadow-xl bg-slate-900">
      {/* Background Image */}
      <Image
        src={current.imageUrl}
        alt={current.title}
        fill
        priority
        className="object-cover transition-all duration-700 brightness-[0.75]"
      />

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/60 to-transparent" />

      {/* Hero Content */}
      <div className="absolute inset-0 flex flex-col justify-center px-6 sm:px-12 md:px-16 max-w-2xl z-10">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-600/90 text-white text-xs font-bold w-fit mb-3 sm:mb-4 shadow backdrop-blur-sm">
          <Sparkles className="h-3.5 w-3.5" />
          <span>OFFICIAL RETAIL PARTNER</span>
        </div>

        <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-white leading-tight tracking-tight drop-shadow">
          {current.title}
        </h1>

        {current.subtitle && (
          <p className="text-sm sm:text-base md:text-lg text-slate-200 mt-2 sm:mt-3 line-clamp-2 max-w-xl">
            {current.subtitle}
          </p>
        )}

        <div className="mt-5 sm:mt-8 flex items-center gap-3">
          <Button
            size="lg"
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 sm:px-8 shadow-lg shadow-blue-600/30 flex items-center gap-2"
            asChild
          >
            <Link href={current.ctaLink || "/shop"}>
              {current.ctaText || "Shop Now"} <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>

          <Button
            variant="outline"
            size="lg"
            className="hidden sm:inline-flex border-white/40 text-white bg-white/10 hover:bg-white hover:text-slate-900 backdrop-blur-sm font-semibold"
            asChild
          >
            <Link href="/offers">View Offers</Link>
          </Button>
        </div>
      </div>

      {/* Navigation Arrows */}
      {banners.length > 1 && (
        <>
          <button
            onClick={() =>
              setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length)
            }
            className="absolute left-3 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-sm flex items-center justify-center transition z-20"
            aria-label="Previous slide"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            onClick={() =>
              setCurrentIndex((prev) => (prev + 1) % banners.length)
            }
            className="absolute right-3 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-sm flex items-center justify-center transition z-20"
            aria-label="Next slide"
          >
            <ChevronRight className="h-6 w-6" />
          </button>

          {/* Dots Indicator */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20">
            {banners.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`h-2.5 rounded-full transition-all ${
                  idx === currentIndex ? "w-8 bg-blue-500" : "w-2.5 bg-white/50"
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
