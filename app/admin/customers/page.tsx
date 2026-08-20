import React from "react";
import prisma from "@/lib/prisma";
import { CustomerManager } from "@/components/admin/customer-manager";

export const revalidate = 0;

export default async function AdminCustomersPage() {
  const customers = await prisma.customer.findMany({
    orderBy: { totalSpent: "desc" },
    include: {
      _count: { select: { orders: true } },
    },
  });

  return <CustomerManager initialCustomers={customers} />;
}
