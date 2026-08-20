import React from "react";
import prisma from "@/lib/prisma";
import { CouponsClient } from "@/components/admin/coupons-client";

export const revalidate = 0;

export default async function AdminCouponsPage() {
  const coupons = await prisma.coupon.findMany({
    orderBy: { createdAt: "desc" },
  });

  return <CouponsClient coupons={coupons} />;
}
