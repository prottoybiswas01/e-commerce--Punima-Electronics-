"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { formatPrice } from "@/lib/utils";
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
import { Tag, Plus, CheckCircle2, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface CouponsClientProps {
  coupons: any[];
}

export function CouponsClient({ coupons }: CouponsClientProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    code: "",
    type: "PERCENTAGE",
    value: 10,
    minOrderAmount: 1000,
    maxDiscount: 1500,
    usageLimit: 100,
    perCustomerLimit: 1,
    startDate: new Date().toISOString().slice(0, 10),
    isActive: true,
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/admin/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to create coupon");
      }

      toast.success("Coupon voucher created successfully");
      setIsOpen(false);
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Error creating coupon");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Coupons & Voucher Management
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Create percentage discounts, flat amount vouchers, and free shipping codes.
          </p>
        </div>

        <Button
          size="sm"
          onClick={() => setIsOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 font-bold text-xs shadow"
        >
          <Plus className="h-4 w-4 mr-1" /> Add New Coupon
        </Button>
      </div>

      {/* Coupons Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b">
              <tr>
                <th className="p-3.5">Coupon Code</th>
                <th className="p-3.5">Discount Type</th>
                <th className="p-3.5">Value</th>
                <th className="p-3.5">Min. Spend</th>
                <th className="p-3.5">Usage Count</th>
                <th className="p-3.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {coupons.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50/60 transition">
                  <td className="p-3.5">
                    <span className="font-mono font-extrabold text-sm text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                      {c.code}
                    </span>
                  </td>
                  <td className="p-3.5 font-semibold text-slate-700">{c.type}</td>
                  <td className="p-3.5 font-bold text-slate-900">
                    {c.type === "PERCENTAGE" ? `${c.value}%` : formatPrice(c.value)}
                  </td>
                  <td className="p-3.5 text-slate-600">{formatPrice(c.minOrderAmount)}</td>
                  <td className="p-3.5 font-semibold text-slate-700">
                    {c.usageCount} / {c.usageLimit || "∞"}
                  </td>
                  <td className="p-3.5">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      c.isActive ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-600"
                    }`}>
                      {c.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Coupon Modal */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">Create Coupon Voucher</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleCreate} className="space-y-3 py-2 text-xs">
            <div className="space-y-1">
              <Label htmlFor="code">Coupon Code *</Label>
              <Input
                id="code"
                placeholder="e.g. SAVE1000"
                value={formData.code}
                onChange={(e) => setFormData((p) => ({ ...p, code: e.target.value.toUpperCase() }))}
                className="uppercase font-mono font-bold"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="type">Discount Type</Label>
                <select
                  id="type"
                  value={formData.type}
                  onChange={(e) => setFormData((p) => ({ ...p, type: e.target.value }))}
                  className="w-full h-10 px-3 rounded-md border border-slate-200 bg-white text-xs font-semibold"
                >
                  <option value="PERCENTAGE">PERCENTAGE (%)</option>
                  <option value="FIXED_AMOUNT">FIXED AMOUNT (BDT)</option>
                  <option value="FREE_SHIPPING">FREE SHIPPING</option>
                </select>
              </div>

              <div className="space-y-1">
                <Label htmlFor="value">Discount Value *</Label>
                <Input
                  id="value"
                  type="number"
                  value={formData.value}
                  onChange={(e) => setFormData((p) => ({ ...p, value: parseFloat(e.target.value) || 0 }))}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="minOrderAmount">Minimum Spend (BDT)</Label>
                <Input
                  id="minOrderAmount"
                  type="number"
                  value={formData.minOrderAmount}
                  onChange={(e) => setFormData((p) => ({ ...p, minOrderAmount: parseFloat(e.target.value) || 0 }))}
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="usageLimit">Max Usage Limit</Label>
                <Input
                  id="usageLimit"
                  type="number"
                  value={formData.usageLimit}
                  onChange={(e) => setFormData((p) => ({ ...p, usageLimit: parseInt(e.target.value, 10) || 100 }))}
                />
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700 font-bold">
                {isSubmitting ? "Creating..." : "Save Coupon"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
