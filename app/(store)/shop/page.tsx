import React from "react";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { ProductCard } from "@/components/store/product-card";
import { Button } from "@/components/ui/button";
import {
  SlidersHorizontal,
  X,
  ChevronDown,
  RotateCcw,
  Check,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export const revalidate = 0;

interface ShopPageProps {
  searchParams: {
    category?: string;
    brand?: string;
    minPrice?: string;
    maxPrice?: string;
    sort?: string;
    search?: string;
    inStock?: string;
    page?: string;
  };
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const {
    category,
    brand,
    minPrice,
    maxPrice,
    sort = "newest",
    search,
    inStock,
    page = "1",
  } = searchParams;

  const pageSize = 12;
  const currentPage = parseInt(page, 10) || 1;

  // Build Prisma where clause
  const where: any = {
    isActive: true,
    isArchived: false,
  };

  if (search) {
    where.OR = [
      { name: { contains: search } },
      { description: { contains: search } },
      { sku: { contains: search } },
      { tags: { contains: search } },
    ];
  }

  if (category) {
    where.category = { slug: category };
  }

  if (brand) {
    where.brand = { slug: brand };
  }

  if (minPrice || maxPrice) {
    where.price = {};
    if (minPrice) where.price.gte = parseFloat(minPrice);
    if (maxPrice) where.price.lte = parseFloat(maxPrice);
  }

  if (inStock === "true") {
    where.stock = { gt: 0 };
  }

  // Determine sorting
  let orderBy: any = { createdAt: "desc" };
  if (sort === "price_low") orderBy = { price: "asc" };
  if (sort === "price_high") orderBy = { price: "desc" };
  if (sort === "best_selling") orderBy = { isBestSeller: "desc" };
  if (sort === "rating") orderBy = { rating: "desc" };

  const [products, totalCount, categories, brands] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy,
      skip: (currentPage - 1) * pageSize,
      take: pageSize,
      include: { images: true, category: true, brand: true },
    }),
    prisma.product.count({ where }),
    prisma.category.findMany({ where: { isActive: true }, orderBy: { name: "asc" } }),
    prisma.brand.findMany({ where: { isActive: true }, orderBy: { name: "asc" } }),
  ]);

  const totalPages = Math.ceil(totalCount / pageSize);

  // Helper to build URL query
  const createQueryString = (key: string, value: string | null) => {
    const params = new URLSearchParams();
    if (category) params.set("category", category);
    if (brand) params.set("brand", brand);
    if (minPrice) params.set("minPrice", minPrice);
    if (maxPrice) params.set("maxPrice", maxPrice);
    if (sort) params.set("sort", sort);
    if (search) params.set("search", search);
    if (inStock) params.set("inStock", inStock);

    if (value === null) {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    return `/shop?${params.toString()}`;
  };

  const FilterContent = () => (
    <div className="space-y-6 text-sm">
      {/* Categories Filter */}
      <div>
        <h4 className="font-bold text-slate-900 mb-3 uppercase text-xs tracking-wider">
          Categories
        </h4>
        <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
          <Link
            href={createQueryString("category", null)}
            className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition ${
              !category ? "bg-blue-50 text-blue-600 font-bold" : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <span>All Categories</span>
            {!category && <Check className="h-3.5 w-3.5" />}
          </Link>
          {categories.map((c) => (
            <Link
              key={c.id}
              href={createQueryString("category", c.slug)}
              className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition ${
                category === c.slug ? "bg-blue-50 text-blue-600 font-bold" : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <span>{c.name}</span>
              {category === c.slug && <Check className="h-3.5 w-3.5" />}
            </Link>
          ))}
        </div>
      </div>

      {/* Brands Filter */}
      <div className="border-t border-slate-200 pt-5">
        <h4 className="font-bold text-slate-900 mb-3 uppercase text-xs tracking-wider">
          Brands
        </h4>
        <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
          <Link
            href={createQueryString("brand", null)}
            className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition ${
              !brand ? "bg-blue-50 text-blue-600 font-bold" : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <span>All Brands</span>
            {!brand && <Check className="h-3.5 w-3.5" />}
          </Link>
          {brands.map((b) => (
            <Link
              key={b.id}
              href={createQueryString("brand", b.slug)}
              className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition ${
                brand === b.slug ? "bg-blue-50 text-blue-600 font-bold" : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <span>{b.name}</span>
              {brand === b.slug && <Check className="h-3.5 w-3.5" />}
            </Link>
          ))}
        </div>
      </div>

      {/* Availability Filter */}
      <div className="border-t border-slate-200 pt-5">
        <h4 className="font-bold text-slate-900 mb-3 uppercase text-xs tracking-wider">
          Availability
        </h4>
        <Link
          href={createQueryString("inStock", inStock === "true" ? null : "true")}
          className={`flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-semibold border ${
            inStock === "true"
              ? "bg-emerald-50 border-emerald-300 text-emerald-800"
              : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
          }`}
        >
          <span>In Stock Only</span>
          {inStock === "true" && <Check className="h-4 w-4 text-emerald-600" />}
        </Link>
      </div>

      {/* Reset Filters */}
      {(category || brand || minPrice || maxPrice || search || inStock) && (
        <div className="pt-2">
          <Button variant="outline" size="sm" className="w-full text-xs flex items-center gap-1 text-red-600 border-red-200 hover:bg-red-50" asChild>
            <Link href="/shop">
              <RotateCcw className="h-3.5 w-3.5" /> Clear All Filters
            </Link>
          </Button>
        </div>
      )}
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8">
      {/* Breadcrumb & Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <div className="text-xs text-slate-500 font-medium">
            <Link href="/" className="hover:text-blue-600">Home</Link> / <span>Shop Catalog</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            {search ? `Search results for "${search}"` : category ? `${category.replace(/-/g, " ").toUpperCase()}` : "All Products"}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Showing {products.length} of {totalCount} items
          </p>
        </div>

        {/* Sorting Dropdown & Mobile Filter Trigger */}
        <div className="flex items-center gap-2 self-end sm:self-auto w-full sm:w-auto justify-between sm:justify-start">
          {/* Mobile Filter Sheet */}
          <Sheet>
            <SheetTrigger asChild className="lg:hidden">
              <Button variant="outline" size="sm" className="flex items-center gap-1.5 text-xs font-semibold">
                <SlidersHorizontal className="h-3.5 w-3.5" /> Filters
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] overflow-y-auto">
              <SheetHeader className="mb-4 text-left">
                <SheetTitle className="text-base font-bold">Filter Catalog</SheetTitle>
              </SheetHeader>
              <FilterContent />
            </SheetContent>
          </Sheet>

          {/* Sort options */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500 font-medium hidden sm:inline">Sort By:</span>
            <div className="flex flex-wrap gap-1">
              <Link
                href={createQueryString("sort", "newest")}
                className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition ${
                  sort === "newest" ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-700 hover:bg-slate-50 border-slate-200"
                }`}
              >
                Newest
              </Link>
              <Link
                href={createQueryString("sort", "best_selling")}
                className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition ${
                  sort === "best_selling" ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-700 hover:bg-slate-50 border-slate-200"
                }`}
              >
                Best Selling
              </Link>
              <Link
                href={createQueryString("sort", "price_low")}
                className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition ${
                  sort === "price_low" ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-700 hover:bg-slate-50 border-slate-200"
                }`}
              >
                Price: Low ↑
              </Link>
              <Link
                href={createQueryString("sort", "price_high")}
                className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition ${
                  sort === "price_high" ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-700 hover:bg-slate-50 border-slate-200"
                }`}
              >
                Price: High ↓
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Shop Layout: Sidebar + Product Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Desktop Sidebar Filter Column */}
        <aside className="hidden lg:block bg-white p-5 rounded-xl border border-slate-200/90 shadow-sm h-fit sticky top-24">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
            <h3 className="font-bold text-slate-900 flex items-center gap-1.5 text-sm">
              <SlidersHorizontal className="h-4 w-4 text-blue-600" /> Filters
            </h3>
            {(category || brand || search || inStock) && (
              <Link href="/shop" className="text-[11px] text-red-600 font-semibold hover:underline">
                Reset
              </Link>
            )}
          </div>
          <FilterContent />
        </aside>

        {/* Product Grid Area */}
        <div className="lg:col-span-3 space-y-8">
          {products.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-lg mx-auto">
              <div className="h-16 w-16 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 mx-auto mb-4">
                <RotateCcw className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-800">No products found</h3>
              <p className="text-xs text-slate-500 mt-1">
                We couldn't find any products matching your selected filter criteria. Try adjusting your filters or search keywords.
              </p>
              <Button className="mt-6" asChild>
                <Link href="/shop">Clear Filters</Link>
              </Button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 pt-6 border-t border-slate-200">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <Link
                      key={p}
                      href={createQueryString("page", String(p))}
                      className={`h-9 w-9 rounded-lg flex items-center justify-center text-xs font-bold transition ${
                        currentPage === p
                          ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                          : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      {p}
                    </Link>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
