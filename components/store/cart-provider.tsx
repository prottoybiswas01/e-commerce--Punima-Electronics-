"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { toast } from "sonner";

export interface CartItemType {
  id: string; // generated client unique id (e.g. productId-variantId)
  productId: string;
  variantId?: string | null;
  name: string;
  variantName?: string | null;
  price: number;
  originalPrice?: number | null;
  image: string;
  sku: string;
  quantity: number;
  stock: number;
}

interface CartContextType {
  items: CartItemType[];
  addItem: (item: Omit<CartItemType, "id">) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, delta: number) => void;
  clearCart: () => void;
  itemCount: number;
  subtotal: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  couponCode: string;
  setCouponCode: (code: string) => void;
  couponDiscount: number;
  setCouponDiscount: (amount: number) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItemType[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("purnima_cart");
      if (stored) {
        setItems(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Failed to load cart", e);
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("purnima_cart", JSON.stringify(items));
    }
  }, [items, isLoaded]);

  const addItem = (item: Omit<CartItemType, "id">) => {
    const id = `${item.productId}-${item.variantId || "default"}`;

    setItems((prev) => {
      const existing = prev.find((i) => i.id === id);
      if (existing) {
        if (existing.quantity >= item.stock) {
          toast.error(`Maximum available stock is ${item.stock}`);
          return prev;
        }
        toast.success(`Updated quantity for ${item.name}`);
        return prev.map((i) =>
          i.id === id
            ? { ...i, quantity: Math.min(i.quantity + item.quantity, item.stock) }
            : i
        );
      }
      toast.success(`Added ${item.name} to cart`);
      return [...prev, { ...item, id }];
    });

    setIsCartOpen(true);
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
    toast.info("Item removed from cart");
  };

  const updateQuantity = (id: string, delta: number) => {
    setItems((prev) =>
      prev
        .map((i) => {
          if (i.id === id) {
            const nextQty = i.quantity + delta;
            if (nextQty > i.stock) {
              toast.error(`Only ${i.stock} units available in stock`);
              return i;
            }
            if (nextQty <= 0) return null;
            return { ...i, quantity: nextQty };
          }
          return i;
        })
        .filter(Boolean) as CartItemType[]
    );
  };

  const clearCart = () => {
    setItems([]);
    setCouponCode("");
    setCouponDiscount(0);
  };

  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        itemCount,
        subtotal,
        isCartOpen,
        setIsCartOpen,
        couponCode,
        setCouponCode,
        couponDiscount,
        setCouponDiscount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
