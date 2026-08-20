"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "./cart-provider";
import { useWishlist } from "./wishlist-provider";
import { useAuth } from "@/components/auth/auth-provider";
import {
  Search,
  ShoppingCart,
  Heart,
  User,
  Menu,
  ChevronDown,
  Sparkles,
  Layers,
  Zap,
  LogOut,
  MapPin,
  ShoppingBag,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

export function Header({
  categories = [],
}: {
  categories?: Array<{ id: string; name: string; slug: string; icon?: string | null }>;
}) {
  const router = useRouter();
  const { itemCount, setIsCartOpen } = useCart();
  const { wishlistCount } = useWishlist();
  const { user, customer, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const displayName = user?.displayName || customer?.name || user?.email?.split("@")[0] || null;

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm">
      {/* Main Header Row */}
      <div className="container mx-auto px-4 py-3 sm:py-3.5 flex items-center justify-between gap-4">
        {/* Mobile Menu Trigger & Logo */}
        <div className="flex items-center gap-3">
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild className="lg:hidden">
              <Button variant="ghost" size="icon" className="text-slate-700">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] p-0">
              <SheetHeader className="p-4 bg-slate-900 text-white text-left">
                <SheetTitle className="text-white flex items-center gap-2 text-lg">
                  <span className="h-6 w-6 rounded bg-rose-600 flex items-center justify-center text-xs font-bold">PE</span>
                  Purnima Electronics
                </SheetTitle>
              </SheetHeader>
              <div className="p-4 space-y-4">
                <div className="space-y-1">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider px-2 py-1">
                    Categories
                  </div>
                  {categories.map((cat) => (
                    <Link
                      key={cat.id}
                      href={`/shop?category=${cat.slug}`}
                      onClick={() => setMobileMenuOpen(false)}
                      className="block px-3 py-2 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-100 hover:text-blue-600"
                    >
                      {cat.name}
                    </Link>
                  ))}
                </div>
                <div className="border-t border-slate-200 pt-3 space-y-1">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider px-2 py-1">
                    Quick Navigation
                  </div>
                  <Link
                    href="/shop"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
                  >
                    All Products
                  </Link>
                  <Link
                    href="/offers"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 text-sm font-medium text-rose-600 hover:bg-rose-50"
                  >
                    Special Offers 🔥
                  </Link>
                  <Link
                    href="/track-order"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
                  >
                    Track Order
                  </Link>
                  <Link
                    href="/account"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
                  >
                    My Account
                  </Link>
                  <Link
                    href="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 text-sm font-medium text-amber-600 hover:bg-amber-50"
                  >
                    Admin Backoffice
                  </Link>
                </div>
              </div>
            </SheetContent>
          </Sheet>

          <Link href="/" className="flex items-center gap-2 group">
            <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl bg-gradient-to-tr from-blue-700 via-indigo-600 to-rose-500 flex items-center justify-center text-white font-extrabold text-lg sm:text-xl shadow-md group-hover:scale-105 transition-transform">
              PE
            </div>
            <div>
              <span className="font-extrabold text-base sm:text-xl tracking-tight text-slate-900 flex items-center gap-1">
                PURNIMA <span className="text-rose-600 text-xs sm:text-sm font-bold bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">ELECTRONICS</span>
              </span>
              <p className="text-[10px] text-slate-500 font-medium hidden sm:block">
                Authentic Gadgets & Home Appliances
              </p>
            </div>
          </Link>
        </div>

        {/* Desktop Search Bar with Category Selector */}
        <form
          onSubmit={handleSearchSubmit}
          className="hidden md:flex flex-1 max-w-xl mx-4 relative"
        >
          <div className="relative w-full flex items-center">
            <input
              type="text"
              placeholder="Search 4K TVs, iPhones, ACs, Washing Machines, Headphones..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-11 pl-4 pr-24 rounded-full border-2 border-slate-200 focus:border-blue-600 focus:outline-none text-sm text-slate-800 transition"
            />
            <Button
              type="submit"
              size="sm"
              className="absolute right-1.5 h-8 px-4 rounded-full bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1 text-xs font-semibold shadow"
            >
              <Search className="h-3.5 w-3.5" /> Search
            </Button>
          </div>
        </form>

        {/* Action Icons (Wishlist, Cart, User) */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Wishlist */}
          <Link
            href="/wishlist"
            className="relative p-2 text-slate-700 hover:text-rose-600 hover:bg-slate-100 rounded-full transition"
            title="Wishlist"
          >
            <Heart className="h-5 w-5 sm:h-6 sm:w-6" />
            {wishlistCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-rose-600 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-white">
                {wishlistCount}
              </span>
            )}
          </Link>

          {/* Cart Trigger */}
          <button
            onClick={() => setIsCartOpen(true)}
            className="relative flex items-center gap-2 p-2 sm:px-3 sm:py-2 text-slate-700 hover:text-blue-600 hover:bg-blue-50/80 rounded-full sm:rounded-xl transition border border-transparent hover:border-blue-100"
            title="Shopping Cart"
          >
            <div className="relative">
              <ShoppingCart className="h-5 w-5 sm:h-6 sm:w-6" />
              {itemCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 h-4 w-4 sm:h-5 sm:w-5 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-white">
                  {itemCount}
                </span>
              )}
            </div>
            <div className="hidden lg:block text-left text-xs">
              <div className="text-slate-400 text-[10px]">My Cart</div>
              <div className="font-bold text-slate-900">{itemCount} items</div>
            </div>
          </button>

          {/* Account Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center gap-1.5 text-slate-700 hover:text-blue-600 rounded-full px-2"
              >
                {user ? (
                  <div className="h-8 w-8 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shadow">
                    {(displayName || "U")[0].toUpperCase()}
                  </div>
                ) : (
                  <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 border border-slate-200">
                    <User className="h-4 w-4" />
                  </div>
                )}
                <div className="hidden sm:block text-left text-xs">
                  {user ? (
                    <>
                      <div className="text-[10px] text-slate-400">Hello,</div>
                      <div className="font-bold text-slate-900 truncate max-w-[80px]">
                        {displayName}
                      </div>
                    </>
                  ) : (
                    <span className="font-semibold text-slate-700">Sign In</span>
                  )}
                </div>
                <ChevronDown className="h-3 w-3 text-slate-400 hidden sm:block" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 p-1.5">
              {user ? (
                <>
                  <DropdownMenuLabel className="font-bold text-slate-900 text-xs px-2 py-1.5">
                    <div>{displayName}</div>
                    <div className="text-[10px] text-slate-400 font-normal truncate">{user.email}</div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/account" className="flex items-center gap-2 text-xs py-2">
                      <User className="h-3.5 w-3.5 text-slate-500" /> My Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/account" className="flex items-center gap-2 text-xs py-2">
                      <ShoppingBag className="h-3.5 w-3.5 text-slate-500" /> My Orders
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/account" className="flex items-center gap-2 text-xs py-2">
                      <MapPin className="h-3.5 w-3.5 text-slate-500" /> Saved Addresses
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/track-order" className="flex items-center gap-2 text-xs py-2">
                      <Zap className="h-3.5 w-3.5 text-slate-500" /> Track Order
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/admin" className="text-amber-600 font-semibold flex items-center justify-between text-xs py-2">
                      Admin Backoffice <Zap className="h-3 w-3" />
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={logout}
                    className="text-rose-600 font-semibold flex items-center gap-2 text-xs py-2 cursor-pointer"
                  >
                    <LogOut className="h-3.5 w-3.5" /> Sign Out
                  </DropdownMenuItem>
                </>
              ) : (
                <>
                  <DropdownMenuItem asChild>
                    <Link href="/login" className="font-bold text-blue-600 text-xs py-2">
                      Sign In
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/register" className="text-xs py-2 font-medium">
                      Create Account
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/track-order" className="text-xs py-2">
                      Track Order
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/admin/login" className="text-slate-500 text-xs py-2">
                      Admin Login
                    </Link>
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Secondary Category Navigation Bar (Desktop) */}
      <nav className="hidden lg:block bg-slate-50 border-t border-slate-200/80">
        <div className="container mx-auto px-4 flex items-center justify-between text-sm font-medium">
          <div className="flex items-center gap-1">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-none font-semibold hover:bg-blue-700 transition text-xs tracking-wide">
                  <Layers className="h-4 w-4" />
                  <span>ALL CATEGORIES</span>
                  <ChevronDown className="h-3.5 w-3.5 ml-1" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-60">
                {categories.map((cat) => (
                  <DropdownMenuItem key={cat.id} asChild>
                    <Link href={`/shop?category=${cat.slug}`} className="cursor-pointer">
                      {cat.name}
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <Link
              href="/shop"
              className="px-4 py-2.5 text-slate-700 hover:text-blue-600 hover:bg-white transition"
            >
              Shop
            </Link>
            <Link
              href="/shop?sort=best_selling"
              className="px-4 py-2.5 text-slate-700 hover:text-blue-600 hover:bg-white transition"
            >
              Best Sellers
            </Link>
            <Link
              href="/shop?sort=newest"
              className="px-4 py-2.5 text-slate-700 hover:text-blue-600 hover:bg-white transition"
            >
              New Arrivals
            </Link>
            <Link
              href="/offers"
              className="px-4 py-2.5 text-rose-600 font-bold hover:bg-rose-50/80 transition flex items-center gap-1"
            >
              <Sparkles className="h-3.5 w-3.5 text-rose-500" />
              Offers & Promotions
            </Link>
            <Link
              href="/about"
              className="px-4 py-2.5 text-slate-600 hover:text-blue-600 hover:bg-white transition"
            >
              About Us
            </Link>
            <Link
              href="/contact"
              className="px-4 py-2.5 text-slate-600 hover:text-blue-600 hover:bg-white transition"
            >
              Contact
            </Link>
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            <span>✨ 100% Genuine Products with Official Warranty</span>
          </div>
        </div>
      </nav>

      {/* Mobile Search input bar */}
      <div className="md:hidden px-4 pb-2.5 pt-1">
        <form onSubmit={handleSearchSubmit} className="relative">
          <input
            type="text"
            placeholder="Search TV, Phone, AC, Laptops..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-9 pl-3 pr-10 rounded-lg border border-slate-200 text-xs focus:outline-none focus:border-blue-600"
          />
          <button
            type="submit"
            className="absolute right-2 top-2 text-slate-400 hover:text-blue-600"
          >
            <Search className="h-4 w-4" />
          </button>
        </form>
      </div>
    </header>
  );
}
