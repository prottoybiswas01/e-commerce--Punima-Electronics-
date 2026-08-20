import React from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { OrderDetailClient } from "@/components/admin/order-detail-client";

export const revalidate = 0;

interface OrderDetailPageProps {
  params: {
    id: string;
  };
}

export default async function OrderDetailPage({ params }: OrderDetailPageProps) {
  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: {
      items: true,
      timeline: { orderBy: { createdAt: "asc" } },
      courierShipment: true,
    },
  });

  if (!order) {
    notFound();
  }

  return (
    <div className="space-y-4">
      <div className="text-xs text-slate-500 font-medium no-print">
        <Link href="/admin/orders" className="hover:text-blue-600">Orders</Link> / <span>#{order.orderNumber}</span>
      </div>

      <OrderDetailClient order={order} />
    </div>
  );
}
