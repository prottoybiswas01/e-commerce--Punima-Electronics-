"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { toast } from "sonner";

export interface WishlistItemType {
  productId: string;
  name: string;
  slug: string;
  price: number;
  originalPrice?: number | null;
  image: string;
  categoryName?: string;
  stock: number;
}

interface WishlistContextType {
  items: WishlistItemType[];
  isInWishlist: (productId: string) => boolean;
  toggleWishlist: (item: WishlistItemType) => void;
  removeFromWishlist: (productId: string) => void;
  wishlistCount: number;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<WishlistItemType[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("purnima_wishlist");
      if (stored) {
        setItems(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Failed to load wishlist", e);
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("purnima_wishlist", JSON.stringify(items));
    }
  }, [items, isLoaded]);

  const isInWishlist = (productId: string) => {
    return items.some((i) => i.productId === productId);
  };

  const toggleWishlist = (item: WishlistItemType) => {
    if (isInWishlist(item.productId)) {
      setItems((prev) => prev.filter((i) => i.productId !== item.productId));
      toast.info(`Removed ${item.name} from Wishlist`);
    } else {
      setItems((prev) => [...prev, item]);
      toast.success(`Added ${item.name} to Wishlist`);
    }
  };

  const removeFromWishlist = (productId: string) => {
    setItems((prev) => prev.filter((i) => i.productId !== productId));
    toast.info("Removed from Wishlist");
  };

  return (
    <WishlistContext.Provider
      value={{
        items,
        isInWishlist,
        toggleWishlist,
        removeFromWishlist,
        wishlistCount: items.length,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
}
