import React from "react";
import Image from "next/image";
import prisma from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Plus, Image as ImageIcon, ExternalLink } from "lucide-react";

export const revalidate = 0;

export default async function AdminBannersPage() {
  const banners = await prisma.banner.findMany({
    orderBy: { displayOrder: "asc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Homepage Hero Banners
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure dynamic homepage hero promotional sliders, call-to-action links and titles.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {banners.map((b) => (
          <div
            key={b.id}
            className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm flex flex-col justify-between"
          >
            <div>
              <div className="relative h-44 w-full bg-slate-900">
                <Image src={b.imageUrl} alt={b.title} fill className="object-cover opacity-90" />
                <span className="absolute top-2 left-2 bg-slate-900/80 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-0.5 rounded">
                  Slide #{b.displayOrder}
                </span>
              </div>

              <div className="p-5 space-y-2">
                <h3 className="font-bold text-slate-900 text-base">{b.title}</h3>
                {b.subtitle && <p className="text-xs text-slate-500">{b.subtitle}</p>}
                <div className="text-xs text-slate-400 font-mono pt-1">
                  CTA Link: <span className="text-blue-600 font-semibold">{b.ctaLink}</span>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                b.isActive ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-600"
              }`}>
                {b.isActive ? "Active" : "Inactive"}
              </span>
              <Button size="sm" variant="outline" className="h-7 text-xs font-semibold" asChild>
                <a href={b.ctaLink} target="_blank" rel="noreferrer">
                  Preview CTA <ExternalLink className="h-3 w-3 ml-1" />
                </a>
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
