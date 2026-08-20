import React from "react";
import prisma from "@/lib/prisma";
import { AuthProvider } from "@/components/auth/auth-provider";
import { CartProvider } from "@/components/store/cart-provider";
import { WishlistProvider } from "@/components/store/wishlist-provider";
import { AnnouncementBar } from "@/components/store/announcement-bar";
import { Header } from "@/components/store/header";
import { Footer } from "@/components/store/footer";
import { MobileNav } from "@/components/store/mobile-nav";
import { CartDrawer } from "@/components/store/cart-drawer";

export default async function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const categories = await prisma.category.findMany({
    where: { isActive: true },
    orderBy: { displayOrder: "asc" },
    select: { id: true, name: true, slug: true, icon: true },
  });

  return (
    <AuthProvider>
      <CartProvider>
        <WishlistProvider>
          <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
            <AnnouncementBar />
            <Header categories={categories} />
            <main className="flex-1 pb-16 sm:pb-0">{children}</main>
            <Footer />
            <MobileNav />
            <CartDrawer />
          </div>
        </WishlistProvider>
      </CartProvider>
    </AuthProvider>
  );
}
