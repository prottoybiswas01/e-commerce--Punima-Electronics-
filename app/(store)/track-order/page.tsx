import React from "react";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { OrderTimelineView } from "@/components/store/order-timeline-view";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, ShieldCheck, Truck, Package, HelpCircle } from "lucide-react";

export const revalidate = 0;

interface TrackOrderPageProps {
  searchParams: {
    search?: string;
  };
}

export default async function TrackOrderPage({ searchParams }: TrackOrderPageProps) {
  const query = searchParams.search?.trim();

  let order = null;
  if (query) {
    order = await prisma.order.findFirst({
      where: {
        OR: [
          { orderNumber: { equals: query } },
          { customerPhone: { equals: query } },
          { consignmentId: { equals: query } },
        ],
      },
      include: {
        items: true,
        timeline: { orderBy: { createdAt: "asc" } },
      },
    });
  }

  return (
    <div className="container mx-auto px-4 py-8 sm:py-12 max-w-3xl space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 text-blue-600 text-xs font-bold uppercase tracking-wider bg-blue-50 px-3 py-1 rounded-full">
          <Truck className="h-3.5 w-3.5" />
          <span>LIVE SHIPMENT TRACKING</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Track Your Order
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
          Enter your Order Reference Number (e.g. <code>ORD-20260818-100234</code>) or Mobile Number to view live Pathao courier status.
        </p>
      </div>

      {/* Search Input Box */}
      <form action="/track-order" method="GET" className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Input
              name="search"
              defaultValue={query || ""}
              placeholder="Enter Order # or 11-digit Phone Number..."
              className="h-12 text-sm pl-4 pr-10 rounded-xl"
              required
            />
          </div>
          <Button type="submit" size="lg" className="bg-blue-600 hover:bg-blue-700 font-bold h-12 px-6 rounded-xl flex items-center gap-2">
            <Search className="h-4 w-4" /> Track Status
          </Button>
        </div>
      </form>

      {/* Result Section */}
      {query && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
          {order ? (
            <OrderTimelineView order={order} />
          ) : (
            <div className="text-center py-8 space-y-3">
              <div className="h-14 w-14 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto">
                <HelpCircle className="h-8 w-8" />
              </div>
              <h3 className="text-base font-bold text-slate-800">
                No order found for "{query}"
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Please check that you entered the correct order number or phone number used during checkout.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Help Banner */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs text-slate-600 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-blue-600 shrink-0" />
          <span>Need help with your delivery? Call our helpline: <strong>+880 1712-345678</strong></span>
        </div>
        <Link href="/contact" className="text-blue-600 font-bold hover:underline">
          Contact Support →
        </Link>
      </div>
    </div>
  );
}
