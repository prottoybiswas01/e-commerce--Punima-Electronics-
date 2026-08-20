"use client";

import React, { useState } from "react";
import Image from "next/image";

export function ProductGallery({
  images = [],
  productName,
}: {
  images: Array<{ url: string; altText?: string | null; isPrimary?: boolean }>;
  productName: string;
}) {
  const displayImages = images.length > 0
    ? images
    : [{ url: "https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=800", altText: productName }];

  const [activeImage, setActiveImage] = useState(displayImages[0].url);

  return (
    <div className="flex flex-col-reverse md:flex-row gap-4">
      {/* Thumbnails */}
      {displayImages.length > 1 && (
        <div className="flex md:flex-col gap-2 overflow-x-auto md:overflow-y-auto max-h-[480px] shrink-0 pb-2 md:pb-0">
          {displayImages.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setActiveImage(img.url)}
              className={`relative h-16 w-16 sm:h-20 sm:w-20 rounded-xl overflow-hidden border-2 transition shrink-0 ${
                activeImage === img.url
                  ? "border-blue-600 shadow-md ring-2 ring-blue-600/20"
                  : "border-slate-200 hover:border-slate-300 opacity-70 hover:opacity-100"
              }`}
            >
              <Image
                src={img.url}
                alt={img.altText || `${productName} thumbnail ${idx + 1}`}
                fill
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {/* Main Image View */}
      <div className="relative flex-1 aspect-square rounded-2xl overflow-hidden border border-slate-200 bg-white shadow-sm group">
        <Image
          src={activeImage}
          alt={productName}
          fill
          priority
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-contain p-4 group-hover:scale-105 transition-transform duration-500"
        />
      </div>
    </div>
  );
}
