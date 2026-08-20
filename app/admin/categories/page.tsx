import React from "react";
import Image from "next/image";
import prisma from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Layers, Plus, ExternalLink } from "lucide-react";

export const revalidate = 0;

export default async function AdminCategoriesPage() {
  const categories = await prisma.category.findMany({
    include: {
      _count: { select: { products: true } },
    },
    orderBy: { displayOrder: "asc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Categories Management
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Organize catalog categories, mega-menu icons, and storefront display order.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4 flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="relative h-32 w-full rounded-xl overflow-hidden bg-slate-50 border">
                {cat.image && (
                  <Image src={cat.image} alt={cat.name} fill className="object-cover" />
                )}
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-900 text-base">{cat.name}</h3>
                  {cat.isFeatured && (
                    <span className="text-[10px] font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                      Featured
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 line-clamp-2 mt-1">{cat.description}</p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs font-semibold">
              <span className="text-slate-500">{cat._count.products} products</span>
              <Button size="sm" variant="ghost" className="h-7 text-xs text-blue-600 font-bold" asChild>
                <a href={`/shop?category=${cat.slug}`} target="_blank" rel="noreferrer">
                  View in Shop <ExternalLink className="h-3.5 w-3.5 ml-1" />
                </a>
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
