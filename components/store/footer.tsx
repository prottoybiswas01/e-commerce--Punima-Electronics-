"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Phone, Mail, MapPin, Clock, Shield, Truck, RotateCcw, Award, MessageSquareWarning } from "lucide-react";
import { ReportProblemModal } from "@/components/ui/report-problem-modal";

export function Footer() {
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  return (
    <footer className="bg-slate-950 text-slate-300 pt-12 pb-24 sm:pb-12 border-t border-slate-800">
      <div className="container mx-auto px-4">
        {/* Top 4 Value props */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pb-10 border-b border-slate-800">
          <div className="flex items-center gap-3.5">
            <div className="h-12 w-12 rounded-xl bg-blue-900/40 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
              <Award className="h-6 w-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">100% Genuine</h4>
              <p className="text-xs text-slate-400 mt-0.5">Direct from authorized brand distributors</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="h-12 w-12 rounded-xl bg-emerald-900/40 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
              <Truck className="h-6 w-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Nationwide Delivery</h4>
              <p className="text-xs text-slate-400 mt-0.5">Fast Pathao courier coverage across 64 districts</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="h-12 w-12 rounded-xl bg-purple-900/40 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0">
              <RotateCcw className="h-6 w-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">7 Days Replacement</h4>
              <p className="text-xs text-slate-400 mt-0.5">Hassle-free return policy for defects</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="h-12 w-12 rounded-xl bg-rose-900/40 border border-rose-500/30 flex items-center justify-center text-rose-400 shrink-0">
              <Shield className="h-6 w-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Official Warranty</h4>
              <p className="text-xs text-slate-400 mt-0.5">Full brand repair & replacement guarantee</p>
            </div>
          </div>
        </div>

        {/* 4 Footer Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 py-10">
          {/* Col 1: Brand Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-blue-700 via-indigo-600 to-rose-500 flex items-center justify-center text-white font-extrabold text-lg">
                PE
              </div>
              <span className="font-extrabold text-lg tracking-tight text-white">
                PURNIMA ELECTRONICS
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Your most trusted retail destination for official smartphones, 4K Smart TVs, inverter air conditioners, refrigerators, and smart home appliances in Bangladesh.
            </p>
            <div className="text-xs space-y-2 text-slate-300">
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-blue-400 shrink-0 mt-0.5" />
                <span>Shop #12, Level 3, Multiplan Center, Elephant Road, Dhaka</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>+880 1712-345678, +880 1812-987654</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-amber-400 shrink-0" />
                <span>support@purnimaelectronics.com</span>
              </div>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div>
            <h4 className="text-sm font-bold text-white mb-4 uppercase tracking-wider">
              Quick Links
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/shop" className="hover:text-white transition">All Products</Link>
              </li>
              <li>
                <Link href="/offers" className="hover:text-rose-400 transition text-rose-300 font-semibold">Special Offers & Deals</Link>
              </li>
              <li>
                <Link href="/track-order" className="hover:text-white transition">Track Your Order</Link>
              </li>
              <li>
                <Link href="/account" className="hover:text-white transition">My Account & Orders</Link>
              </li>
              <li>
                <Link href="/wishlist" className="hover:text-white transition">Wishlist</Link>
              </li>
              <li>
                <Link href="/admin" className="hover:text-amber-400 transition text-amber-300">Admin Portal</Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Customer Care & Policies */}
          <div>
            <h4 className="text-sm font-bold text-white mb-4 uppercase tracking-wider">
              Customer Service
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/about" className="hover:text-white transition">About Purnima Electronics</Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition">Contact Us & Shop Location</Link>
              </li>
              <li>
                <button
                  onClick={() => setIsReportModalOpen(true)}
                  className="hover:text-blue-400 transition text-slate-300 text-left flex items-center gap-1.5"
                >
                  <MessageSquareWarning className="h-3.5 w-3.5 text-amber-400" />
                  Report a Problem / Feedback
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Business Hours & Payment */}
          <div>
            <h4 className="text-sm font-bold text-white mb-4 uppercase tracking-wider">
              Business Hours & Payment
            </h4>
            <div className="text-xs space-y-2 text-slate-400 mb-4">
              <div className="flex items-start gap-2">
                <Clock className="h-4 w-4 text-indigo-400 shrink-0 mt-0.5" />
                <span>Sat - Thu: 10:00 AM - 8:30 PM (Friday Closed)</span>
              </div>
            </div>

            <h5 className="text-xs font-semibold text-slate-200 mb-2">Accepted Payment Methods:</h5>
            <div className="flex flex-wrap gap-2 text-[11px] font-bold">
              <span className="bg-slate-800 text-slate-200 px-2.5 py-1 rounded border border-slate-700">Cash on Delivery</span>
              <span className="bg-rose-900/60 text-rose-300 px-2.5 py-1 rounded border border-rose-700/50">bKash</span>
              <span className="bg-amber-900/60 text-amber-300 px-2.5 py-1 rounded border border-amber-700/50">Nagad</span>
              <span className="bg-blue-900/60 text-blue-300 px-2.5 py-1 rounded border border-blue-700/50">Visa / Mastercard</span>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-slate-900 pt-6 text-center text-xs text-slate-500 flex flex-col sm:flex-row justify-between items-center gap-2">
          <p>© {new Date().getFullYear()} Purnima Electronics. All rights reserved.</p>
          <button
            onClick={() => setIsReportModalOpen(true)}
            className="text-[11px] text-slate-400 hover:text-white transition flex items-center gap-1"
          >
            <MessageSquareWarning className="h-3 w-3 text-blue-400" /> Send Application Feedback
          </button>
        </div>
      </div>

      <ReportProblemModal
        isOpen={isReportModalOpen}
        onOpenChange={setIsReportModalOpen}
      />
    </footer>
  );
}
