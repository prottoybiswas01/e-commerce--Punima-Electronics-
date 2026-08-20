import React from "react";
import prisma from "@/lib/prisma";
import { BannerManager } from "@/components/admin/banner-manager";

export const revalidate = 0;

export default async function AdminBannersPage() {
  const banners = await prisma.banner.findMany({
    orderBy: { displayOrder: "asc" },
  });

  return <BannerManager initialBanners={banners} />;
}
