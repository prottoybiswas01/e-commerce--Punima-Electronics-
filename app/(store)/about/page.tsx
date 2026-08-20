import React from "react";
import { ShieldCheck, Award, Truck, MapPin, Phone, Mail, Clock } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-8 sm:py-12 max-w-4xl space-y-10">
      <div className="text-center space-y-3">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          About Purnima Electronics
        </h1>
        <p className="text-sm text-slate-600 max-w-2xl mx-auto">
          Providing authentic consumer electronics, official smartphones, inverter air conditioners, smart TVs, and home appliances to customers in Bangladesh since 2012.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm text-center space-y-2">
          <div className="h-12 w-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mx-auto">
            <Award className="h-6 w-6" />
          </div>
          <h3 className="font-bold text-slate-900 text-base">100% Genuine Tech</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            All our products are sourced directly from authorized brand distributors with official warranties.
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm text-center space-y-2">
          <div className="h-12 w-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center mx-auto">
            <Truck className="h-6 w-6" />
          </div>
          <h3 className="font-bold text-slate-900 text-base">Fast Pathao Delivery</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Quick 24-48 hours home delivery across all 64 districts with Cash on Delivery support.
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm text-center space-y-2">
          <div className="h-12 w-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center mx-auto">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <h3 className="font-bold text-slate-900 text-base">Customer First</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            7-day easy replacement guarantee and responsive after-sales customer support.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-4">
        <h2 className="text-xl font-bold text-slate-900">Our Retail Shop Location</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-600">
          <div className="flex items-start gap-2.5">
            <MapPin className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-900 block mb-0.5">Physical Store Address:</strong>
              Shop #12, Level 3, Multiplan Center, New Elephant Road, Dhaka-1205, Bangladesh
            </div>
          </div>
          <div className="flex items-start gap-2.5">
            <Clock className="h-4 w-4 text-indigo-600 shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-900 block mb-0.5">Store Opening Hours:</strong>
              Saturday to Thursday: 10:00 AM - 8:30 PM (Friday Closed)
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
