"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { formatPrice } from "@/lib/utils";
import { StockStatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  ExternalLink,
  Package,
  Send,
  Mail,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";

interface ProductListClientProps {
  products: any[];
  totalCount: number;
  categories: any[];
  currentPage: number;
  totalPages: number;
  search?: string;
  category?: string;
}

export function ProductListClient({
  products,
  totalCount,
  categories,
  currentPage,
  totalPages,
  search,
  category,
}: ProductListClientProps) {
  const router = useRouter();
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isBroadcastOpen, setIsBroadcastOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [testEmail, setTestEmail] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [isBroadcasting, setIsBroadcasting] = useState(false);

  const handleOpenDelete = (prod: any) => {
    setSelectedProduct(prod);
    setIsDeleteOpen(true);
  };

  const handleOpenBroadcast = (prod: any) => {
    setSelectedProduct(prod);
    setTestEmail("");
    setIsBroadcastOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedProduct) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/products/${selectedProduct.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Product deleted successfully!");
        setIsDeleteOpen(false);
        router.refresh();
      } else {
        toast.error(data.message || "Failed to delete product");
      }
    } catch (e: any) {
      toast.error(e.message || "Failed to delete product");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleBroadcastEmail = async (sendToAll: boolean) => {
    if (!selectedProduct) return;
    if (!sendToAll && !testEmail) {
      toast.error("Please enter an email address to send the test campaign");
      return;
    }

    setIsBroadcasting(true);
    try {
      const res = await fetch(`/api/admin/products/${selectedProduct.id}/broadcast`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetEmail: sendToAll ? undefined : testEmail.trim(),
        }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success(data.message || "Email campaign sent successfully!");
        setIsBroadcastOpen(false);
      } else {
        toast.error(data.message || "Failed to send email broadcast");
      }
    } catch (e: any) {
      toast.error(e.message || "Error sending broadcast email");
    } finally {
      setIsBroadcasting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Package className="h-6 w-6 text-blue-600" />
            Product Management
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Create, edit, and organize retail electronics, pricing, cost and inventory stock.
          </p>
        </div>

        <Button className="bg-blue-600 hover:bg-blue-700 font-bold text-xs shadow" asChild>
          <Link href="/admin/products/new" className="flex items-center gap-1.5">
            <Plus className="h-4 w-4" /> Add New Product
          </Link>
        </Button>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-3">
        <form method="GET" action="/admin/products" className="flex-1 flex gap-2">
          <div className="relative flex-1">
            <Input
              name="search"
              defaultValue={search || ""}
              placeholder="Search product by name, SKU..."
              className="h-10 text-xs pl-9"
            />
            <Search className="h-4 w-4 text-slate-400 absolute left-3 top-3" />
          </div>

          <select
            name="category"
            defaultValue={category || ""}
            className="h-10 px-3 rounded-md border border-slate-200 bg-white text-xs text-slate-700"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

          <Button type="submit" size="sm" className="bg-slate-900 text-xs px-4">
            Filter
          </Button>
          {(search || category) && (
            <Button variant="outline" size="sm" asChild>
              <Link href="/admin/products">Reset</Link>
            </Button>
          )}
        </form>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b">
              <tr>
                <th className="p-3.5">Product</th>
                <th className="p-3.5">SKU</th>
                <th className="p-3.5">Category</th>
                <th className="p-3.5">Selling Price</th>
                <th className="p-3.5">Cost Price</th>
                <th className="p-3.5">Stock Level</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {products.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400">
                    No products found. Click "Add New Product" to create one.
                  </td>
                </tr>
              ) : (
                products.map((p) => {
                  const imgUrl = p.images[0]?.url || "https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=200";
                  return (
                    <tr key={p.id} className="hover:bg-slate-50/60 transition">
                      <td className="p-3.5">
                        <div className="flex items-center gap-3">
                          <div className="relative h-11 w-11 rounded-lg overflow-hidden bg-slate-50 border shrink-0">
                            <Image src={imgUrl} alt={p.name} fill className="object-cover" />
                          </div>
                          <div>
                            <Link
                              href={`/admin/products/${p.id}/edit`}
                              className="font-bold text-slate-900 hover:text-blue-600 line-clamp-1 max-w-[200px]"
                            >
                              {p.name}
                            </Link>
                            <div className="flex items-center gap-1 mt-0.5">
                              {p.isBestSeller && (
                                <span className="text-[9px] bg-amber-100 text-amber-800 font-bold px-1 rounded">
                                  Best Seller
                                </span>
                              )}
                              {p.isNewArrival && (
                                <span className="text-[9px] bg-blue-100 text-blue-800 font-bold px-1 rounded">
                                  New
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="p-3.5 font-mono font-semibold text-slate-600">{p.sku}</td>
                      <td className="p-3.5 text-slate-600 font-medium">{p.category?.name}</td>
                      <td className="p-3.5 font-bold text-slate-900">{formatPrice(p.price)}</td>
                      <td className="p-3.5 text-slate-500">{formatPrice(p.costPrice)}</td>
                      <td className="p-3.5">
                        <StockStatusBadge stock={p.stock} lowThreshold={p.lowStockThreshold} />
                      </td>
                      <td className="p-3.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          p.isActive ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-600"
                        }`}>
                          {p.isActive ? "Active" : "Draft"}
                        </span>
                      </td>
                      <td className="p-3.5 text-right space-x-1">
                        {/* Send / Broadcast Email Campaign */}
                        <Button
                          size="sm"
                          variant="ghost"
                          title="Broadcast Email Campaign"
                          onClick={() => handleOpenBroadcast(p)}
                          className="h-7 w-7 p-0 text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                        >
                          <Send className="h-3.5 w-3.5" />
                        </Button>
                        <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-slate-500 hover:text-blue-600" asChild>
                          <Link href={`/admin/products/${p.id}/edit`}>
                            <Edit2 className="h-3.5 w-3.5" />
                          </Link>
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleOpenDelete(p)}
                          className="h-7 w-7 p-0 text-slate-500 hover:text-rose-600"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                        <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-slate-500 hover:text-slate-900" asChild>
                          <Link href={`/product/${p.slug}`} target="_blank">
                            <ExternalLink className="h-3.5 w-3.5" />
                          </Link>
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-100 flex justify-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <Link
                key={p}
                href={`/admin/products?page=${p}${search ? `&search=${search}` : ""}${category ? `&category=${category}` : ""}`}
                className={`h-8 w-8 rounded-lg flex items-center justify-center text-xs font-bold transition ${
                  currentPage === p
                    ? "bg-blue-600 text-white"
                    : "bg-slate-50 text-slate-700 hover:bg-slate-100 border"
                }`}
              >
                {p}
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Broadcast Email Marketing Modal */}
      <Dialog open={isBroadcastOpen} onOpenChange={setIsBroadcastOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-slate-900 font-extrabold text-base">
              <Sparkles className="h-5 w-5 text-amber-500" />
              Broadcast Email Marketing Campaign
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border flex items-center gap-3">
              <div className="h-10 w-10 relative rounded-lg overflow-hidden bg-white border shrink-0">
                <img
                  src={selectedProduct?.images?.[0]?.url || "https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=100"}
                  alt={selectedProduct?.name || "Product"}
                  className="h-full w-full object-cover"
                />
              </div>
              <div>
                <strong className="text-slate-900 block text-xs">{selectedProduct?.name}</strong>
                <span className="text-slate-500 font-mono">Price: {formatPrice(selectedProduct?.price || 0)}</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="font-bold text-slate-800">Send Test Email to Specific Address:</Label>
                <button
                  type="button"
                  onClick={() => setTestEmail("bjsacademy38@gmail.com")}
                  className="text-[10px] text-blue-600 font-bold hover:underline"
                >
                  Fill Resend Owner Mail (bjsacademy38@gmail.com)
                </button>
              </div>
              <div className="flex gap-2">
                <Input
                  type="email"
                  placeholder="e.g. bjsacademy38@gmail.com"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  className="h-9 text-xs"
                />
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={isBroadcasting || !testEmail}
                  onClick={() => handleBroadcastEmail(false)}
                  className="shrink-0 text-xs font-semibold"
                >
                  <Mail className="h-3.5 w-3.5 mr-1" /> Send Test
                </Button>
              </div>
              
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-2.5 text-[11px] text-amber-800 space-y-1">
                <div className="font-bold flex items-center gap-1">
                  <span>ℹ️ Resend Domain Verification Note:</span>
                </div>
                <p>
                  While using <code>onboarding@resend.dev</code> (sandbox), Resend only allows testing to your registered account email (<strong>bjsacademy38@gmail.com</strong>).
                </p>
                <p>
                  To broadcast to <strong>ALL customer emails</strong> or any address, add and verify your custom domain at <a href="https://resend.com/domains" target="_blank" rel="noreferrer" className="underline font-bold text-blue-700">resend.com/domains</a> (e.g. <code>kodl.uk</code>), then set <code>RESEND_FROM_EMAIL</code> in Vercel.
                </p>
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={() => setIsBroadcastOpen(false)}>
              Cancel
            </Button>
            <Button
              type="button"
              disabled={isBroadcasting}
              onClick={() => handleBroadcastEmail(true)}
              className="bg-blue-600 hover:bg-blue-700 text-xs font-bold gap-1.5"
            >
              <Send className="h-3.5 w-3.5" />
              {isBroadcasting ? "Broadcasting..." : "Broadcast to All Customers"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="text-rose-600 flex items-center gap-2">
              <Trash2 className="h-5 w-5" /> Delete Product?
            </DialogTitle>
          </DialogHeader>
          <div className="py-2 text-xs text-slate-600">
            Are you sure you want to permanently delete <strong>{selectedProduct?.name}</strong>?
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsDeleteOpen(false)}>
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete Permanently"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
