"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "./cart-provider";
import { formatPrice } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ShoppingBag, Plus, Minus, Trash2, ArrowRight } from "lucide-react";

export function CartDrawer() {
  const {
    items,
    isCartOpen,
    setIsCartOpen,
    removeItem,
    updateQuantity,
    subtotal,
    itemCount,
  } = useCart();

  return (
    <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
      <SheetContent className="flex flex-col w-full sm:max-w-md p-0">
        <SheetHeader className="p-4 border-b border-slate-100 flex-row justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
              <ShoppingBag className="h-4 w-4" />
            </div>
            <SheetTitle className="text-base font-bold text-slate-900">
              Shopping Cart ({itemCount})
            </SheetTitle>
          </div>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
            <div className="h-16 w-16 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 mb-4">
              <ShoppingBag className="h-8 w-8" />
            </div>
            <h3 className="text-base font-semibold text-slate-800">
              Your cart is empty
            </h3>
            <p className="text-sm text-slate-500 mt-1 max-w-xs">
              Explore our wide collection of genuine electronics, gadgets, and home appliances.
            </p>
            <Button
              className="mt-6"
              onClick={() => setIsCartOpen(false)}
              asChild
            >
              <Link href="/shop">Start Shopping</Link>
            </Button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto p-4 space-y-4 divide-y divide-slate-100">
              {items.map((item) => (
                <div key={item.id} className="pt-3 first:pt-0 flex gap-3">
                  <div className="relative h-20 w-20 rounded-lg overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                    <Image
                      src={item.image || "https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=200"}
                      alt={item.name}
                      fill
                      className="object-cover"
                    />
                  </div>

                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start gap-1">
                        <h4 className="text-sm font-medium text-slate-900 line-clamp-2">
                          {item.name}
                        </h4>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-slate-400 hover:text-red-500 transition p-1"
                          title="Remove"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      {item.variantName && (
                        <p className="text-xs text-slate-500 mt-0.5">
                          Variant: {item.variantName}
                        </p>
                      )}
                    </div>

                    <div className="flex justify-between items-center mt-2">
                      <div className="flex items-center border border-slate-200 rounded-md bg-white">
                        <button
                          onClick={() => updateQuantity(item.id, -1)}
                          className="px-2 py-1 text-slate-600 hover:bg-slate-100 text-xs"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="px-2 text-xs font-semibold text-slate-800">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, 1)}
                          className="px-2 py-1 text-slate-600 hover:bg-slate-100 text-xs"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>

                      <div className="text-right">
                        <div className="text-sm font-bold text-slate-900">
                          {formatPrice(item.price * item.quantity)}
                        </div>
                        {item.quantity > 1 && (
                          <div className="text-[11px] text-slate-400">
                            {formatPrice(item.price)} each
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-600">Subtotal</span>
                <span className="font-bold text-slate-900 text-base">
                  {formatPrice(subtotal)}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Delivery charge & discounts calculated at checkout.
              </p>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setIsCartOpen(false)}
                  asChild
                >
                  <Link href="/cart">View Cart</Link>
                </Button>
                <Button
                  className="w-full bg-blue-600 hover:bg-blue-700 font-semibold"
                  onClick={() => setIsCartOpen(false)}
                  asChild
                >
                  <Link href="/checkout" className="flex items-center justify-center gap-1">
                    Checkout <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
