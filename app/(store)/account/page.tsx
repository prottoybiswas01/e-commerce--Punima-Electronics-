import React from "react";
import prisma from "@/lib/prisma";
import { AccountDashboardClient } from "@/components/store/account-dashboard-client";

export const revalidate = 0;

export default async function CustomerAccountPage() {
  const [orders, addresses] = await Promise.all([
    prisma.order.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      include: { items: true },
    }),
    prisma.address.findMany({
      take: 5,
      orderBy: { isDefault: "desc" },
    }),
  ]);

  return <AccountDashboardClient initialOrders={orders} initialAddresses={addresses} />;
}
