"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, ShoppingBag, Heart, ShieldCheck, User } from "lucide-react";
import { useCart } from "./cart-provider";
import { useWishlist } from "./wishlist-provider";
import { cn } from "@/lib/utils";

export function MobileNav() {
  const pathname = usePathname();
  const { itemCount, setIsCartOpen } = useCart();
  const { wishlistCount } = useWishlist();

  const links = [
    { href: "/", label: "Home", icon: Home },
    { href: "/shop", label: "Shop", icon: ShoppingBag },
    { href: "/wishlist", label: "Wishlist", icon: Heart, badge: wishlistCount },
    { href: "/track-order", label: "Track", icon: ShieldCheck },
    { href: "/account", label: "Account", icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 px-2 py-1 sm:hidden shadow-lg">
      <div className="flex justify-around items-center">
        {links.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center py-1 px-2 rounded-lg text-[10px] font-medium transition relative",
                isActive
                  ? "text-blue-600 font-bold"
                  : "text-slate-500 hover:text-slate-900"
              )}
            >
              <div className="relative">
                <Icon className="h-5 w-5" />
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="absolute -top-1 -right-1 h-3.5 w-3.5 bg-rose-600 text-white rounded-full text-[9px] flex items-center justify-center font-bold">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="mt-0.5">{item.label}</span>
            </Link>
          );
        })}

        {/* Floating Mini Cart Button */}
        <button
          onClick={() => setIsCartOpen(true)}
          className="flex flex-col items-center py-1 px-2 text-[10px] font-medium text-slate-500 hover:text-blue-600 relative"
        >
          <div className="relative">
            <ShoppingBag className="h-5 w-5 text-blue-600" />
            {itemCount > 0 && (
              <span className="absolute -top-1 -right-1 h-3.5 w-3.5 bg-blue-600 text-white rounded-full text-[9px] flex items-center justify-center font-bold">
                {itemCount}
              </span>
            )}
          </div>
          <span className="mt-0.5">Cart</span>
        </button>
      </div>
    </nav>
  );
}
