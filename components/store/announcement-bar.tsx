import React from "react";
import Link from "next/link";
import { Phone, MapPin, Truck, ShieldCheck, Flame } from "lucide-react";

export function AnnouncementBar() {
  return (
    <div className="bg-slate-900 text-slate-200 text-xs py-2 px-4 border-b border-slate-800">
      <div className="container mx-auto flex flex-col sm:flex-row justify-between items-center gap-2">
        <div className="flex items-center gap-4 flex-wrap justify-center sm:justify-start">
          <div className="flex items-center gap-1.5 font-medium text-amber-400">
            <Flame className="h-3.5 w-3.5 text-rose-500 animate-pulse" />
            <span>Mega Discount 2026: Use code <strong>SAVE500</strong> for ৳500 off</span>
          </div>
          <span className="hidden md:inline text-slate-600">|</span>
          <div className="hidden md:flex items-center gap-1.5 text-slate-300">
            <Truck className="h-3.5 w-3.5 text-blue-400" />
            <span>Fast Nationwide Home Delivery with Pathao</span>
          </div>
        </div>

        <div className="flex items-center gap-5 text-slate-300">
          <Link
            href="/track-order"
            className="hover:text-white transition flex items-center gap-1 font-medium"
          >
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
            <span>Track Order</span>
          </Link>
          <a
            href="tel:+8801712345678"
            className="hover:text-white transition flex items-center gap-1"
          >
            <Phone className="h-3.5 w-3.5 text-slate-400" />
            <span>+880 1712-345678</span>
          </a>
          <Link
            href="/admin"
            className="hover:text-amber-400 transition bg-slate-800 px-2 py-0.5 rounded text-[11px] font-semibold text-amber-300 border border-amber-500/20"
          >
            Admin Panel
          </Link>
        </div>
      </div>
    </div>
  );
}
