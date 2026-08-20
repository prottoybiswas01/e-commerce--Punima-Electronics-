"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { formatDateTime } from "@/lib/utils";
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
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Warehouse,
  PlusCircle,
  History,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  TrendingDown,
} from "lucide-react";
import { toast } from "sonner";

interface InventoryClientProps {
  products: any[];
  transactions: any[];
}

export function InventoryClient({ products, transactions }: InventoryClientProps) {
  const router = useRouter();
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [changeQty, setChangeQty] = useState<number>(0);
  const [reason, setReason] = useState<string>("RESTOCK");
  const [notes, setNotes] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<"catalog" | "ledger">("catalog");

  const handleOpenAdjustModal = (product: any) => {
    setSelectedProduct(product);
    setChangeQty(10);
    setReason("RESTOCK");
    setNotes("");
  };

  const handleSaveAdjustment = async () => {
    if (!selectedProduct) return;
    if (changeQty === 0) {
      toast.error("Change quantity cannot be zero");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/admin/inventory/adjust", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: selectedProduct.id,
          changeQuantity: changeQty,
          reason,
          notes,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to adjust stock");
      }

      toast.success(`Inventory updated for ${selectedProduct.name}`);
      setSelectedProduct(null);
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Adjustment failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Tabs */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Inventory Management & Ledger
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Audit-tracked stock adjustments with mandatory reason codes and transaction history.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-white p-1 rounded-xl border shadow-sm text-xs font-semibold">
          <button
            onClick={() => setActiveTab("catalog")}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeTab === "catalog" ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            Product Stock Levels
          </button>
          <button
            onClick={() => setActiveTab("ledger")}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeTab === "ledger" ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            Transaction History ({transactions.length})
          </button>
        </div>
      </div>

      {activeTab === "catalog" ? (
        /* Products Stock Table */
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b">
                <tr>
                  <th className="p-3.5">Product</th>
                  <th className="p-3.5">SKU</th>
                  <th className="p-3.5">Category</th>
                  <th className="p-3.5">Current Stock</th>
                  <th className="p-3.5">Sold Qty</th>
                  <th className="p-3.5">Stock Status</th>
                  <th className="p-3.5 text-right">Adjustment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {products.map((p) => {
                  const img = p.images[0]?.url || "https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=200";
                  const sold = p.inventory?.soldQuantity || 0;
                  return (
                    <tr key={p.id} className="hover:bg-slate-50/60 transition">
                      <td className="p-3.5">
                        <div className="flex items-center gap-3">
                          <div className="relative h-10 w-10 rounded-lg overflow-hidden bg-slate-50 border shrink-0">
                            <Image src={img} alt={p.name} fill className="object-cover" />
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 line-clamp-1 max-w-[200px]">
                              {p.name}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              Threshold: {p.lowStockThreshold} units
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="p-3.5 font-mono text-slate-600 font-semibold">{p.sku}</td>
                      <td className="p-3.5 text-slate-600">{p.category?.name}</td>
                      <td className="p-3.5 font-extrabold text-sm text-slate-900">{p.stock}</td>
                      <td className="p-3.5 text-slate-600 font-semibold">{sold}</td>
                      <td className="p-3.5">
                        <StockStatusBadge stock={p.stock} lowThreshold={p.lowStockThreshold} />
                      </td>
                      <td className="p-3.5 text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleOpenAdjustModal(p)}
                          className="h-7 text-xs font-semibold text-blue-600 border-blue-200 hover:bg-blue-50"
                        >
                          <PlusCircle className="h-3.5 w-3.5 mr-1" /> Adjust Stock
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Immutable Transaction Ledger History */
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex justify-between items-center">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <History className="h-4 w-4 text-blue-600" /> Immutable Stock Adjustment Ledger
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b">
                <tr>
                  <th className="p-3">Timestamp</th>
                  <th className="p-3">Product Name</th>
                  <th className="p-3">Previous Stock</th>
                  <th className="p-3">Adjustment</th>
                  <th className="p-3">New Stock</th>
                  <th className="p-3">Reason</th>
                  <th className="p-3">Notes</th>
                  <th className="p-3">Logged By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {transactions.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/60 transition">
                    <td className="p-3 text-slate-400 font-mono">{formatDateTime(t.createdAt)}</td>
                    <td className="p-3 font-bold text-slate-900">{t.inventory?.product?.name || "Product"}</td>
                    <td className="p-3 text-slate-600">{t.previousStock}</td>
                    <td className="p-3 font-extrabold">
                      <span className={t.changeQuantity >= 0 ? "text-emerald-600" : "text-rose-600"}>
                        {t.changeQuantity >= 0 ? `+${t.changeQuantity}` : t.changeQuantity}
                      </span>
                    </td>
                    <td className="p-3 font-bold text-slate-900">{t.newStock}</td>
                    <td className="p-3">
                      <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-mono text-[10px] font-bold">
                        {t.reason}
                      </span>
                    </td>
                    <td className="p-3 text-slate-500">{t.notes || "—"}</td>
                    <td className="p-3 font-semibold text-slate-700">{t.createdBy}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Stock Adjustment Dialog */}
      <Dialog open={Boolean(selectedProduct)} onOpenChange={(open) => !open && setSelectedProduct(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">Adjust Inventory Stock</DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Product: <strong>{selectedProduct?.name}</strong> (SKU: {selectedProduct?.sku})
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2 text-xs">
            <div className="bg-slate-50 p-3 rounded-lg border flex justify-between items-center">
              <span className="text-slate-500">Current Stock:</span>
              <span className="text-base font-extrabold text-slate-900">{selectedProduct?.stock} units</span>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="changeQty">Quantity Change (+ to add, - to subtract) *</Label>
              <Input
                id="changeQty"
                type="number"
                value={changeQty}
                onChange={(e) => setChangeQty(parseInt(e.target.value, 10) || 0)}
                placeholder="+10 or -5"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="reason">Mandatory Adjustment Reason *</Label>
              <select
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full h-10 px-3 rounded-md border border-slate-200 bg-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                <option value="RESTOCK">RESTOCK (New shipment received)</option>
                <option value="PURCHASE">PURCHASE (Vendor purchase)</option>
                <option value="RETURN">RETURN (Customer return restocking)</option>
                <option value="DAMAGE">DAMAGE (Damaged in warehouse / transit)</option>
                <option value="MANUAL_ADJUSTMENT">MANUAL_ADJUSTMENT (Audit count discrepancy)</option>
                <option value="CORRECTION">CORRECTION (Entry mistake correction)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="notes">Notes / PO Reference</Label>
              <Input
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. PO-8921 from Walton Distributor"
              />
            </div>

            <div className="bg-blue-50 p-2.5 rounded-lg text-blue-900 font-semibold flex justify-between">
              <span>Resulting New Stock:</span>
              <span className="font-extrabold text-sm">
                {(selectedProduct?.stock || 0) + changeQty} units
              </span>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              size="sm"
              disabled={isSubmitting}
              onClick={() => setSelectedProduct(null)}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              disabled={isSubmitting}
              onClick={handleSaveAdjustment}
              className="bg-blue-600 hover:bg-blue-700 font-bold"
            >
              {isSubmitting ? "Updating..." : "Commit Transaction"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
