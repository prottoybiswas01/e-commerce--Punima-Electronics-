"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Save, Store, Truck, Shield, Key } from "lucide-react";
import { toast } from "sonner";

interface SettingsFormProps {
  initialSettings: any;
}

export function SettingsForm({ initialSettings }: SettingsFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    shopName: initialSettings?.shopName || "Purnima Electronics",
    logoUrl: initialSettings?.logoUrl || "",
    phone: initialSettings?.phone || "+880 1712-345678",
    email: initialSettings?.email || "support@purnimaelectronics.com",
    address: initialSettings?.address || "Shop #12, Level 3, Multiplan Center, Elephant Road, Dhaka",
    businessHours: initialSettings?.businessHours || "Saturday - Thursday: 10:00 AM - 8:30 PM",
    currency: initialSettings?.currency || "BDT",
    currencySymbol: initialSettings?.currencySymbol || "৳",
    defaultDeliveryInsideDhaka: initialSettings?.defaultDeliveryInsideDhaka || 70,
    defaultDeliveryOutsideDhaka: initialSettings?.defaultDeliveryOutsideDhaka || 130,
    freeShippingThreshold: initialSettings?.freeShippingThreshold || 5000,
    returnPolicy: initialSettings?.returnPolicy || "7 Days Easy Replacement for manufacturing defects.",
    shippingPolicy: initialSettings?.shippingPolicy || "Same day dispatch inside Dhaka.",
    privacyPolicy: initialSettings?.privacyPolicy || "We encrypt all transactions.",
    termsConditions: initialSettings?.termsConditions || "Warranty claims require original invoice.",
    socialFacebook: initialSettings?.socialFacebook || "",
    socialInstagram: initialSettings?.socialInstagram || "",
    socialYoutube: initialSettings?.socialYoutube || "",
    metaTitle: initialSettings?.metaTitle || "",
    metaDescription: initialSettings?.metaDescription || "",
  });

  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          defaultDeliveryInsideDhaka: parseFloat(String(formData.defaultDeliveryInsideDhaka)),
          defaultDeliveryOutsideDhaka: parseFloat(String(formData.defaultDeliveryOutsideDhaka)),
          freeShippingThreshold: parseFloat(String(formData.freeShippingThreshold)),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to save settings");
      }

      toast.success("Store configurations and delivery rates updated!");
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Error saving settings");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl">
      {/* Top Save Bar */}
      <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm sticky top-20 z-20">
        <div>
          <span className="font-bold text-slate-900 text-sm">Store Configuration</span>
          <span className="text-xs text-slate-400 block">Manage delivery matrix, shop info & policies</span>
        </div>
        <Button
          type="submit"
          disabled={isSaving}
          className="bg-blue-600 hover:bg-blue-700 font-bold text-xs shadow px-6"
        >
          <Save className="h-4 w-4 mr-1.5" />
          {isSaving ? "Saving Settings..." : "Save Changes"}
        </Button>
      </div>

      {/* 1. General Shop Information */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100 flex items-center gap-2">
          <Store className="h-4 w-4 text-blue-600" /> General Shop Profile
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="space-y-1">
            <Label htmlFor="shopName">Store Name *</Label>
            <Input
              id="shopName"
              value={formData.shopName}
              onChange={(e) => setFormData((p) => ({ ...p, shopName: e.target.value }))}
              required
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="phone">Helpline Mobile Phone *</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => setFormData((p) => ({ ...p, phone: e.target.value }))}
              required
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="email">Support Email Address *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))}
              required
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="businessHours">Business Working Hours</Label>
            <Input
              id="businessHours"
              value={formData.businessHours}
              onChange={(e) => setFormData((p) => ({ ...p, businessHours: e.target.value }))}
            />
          </div>

          <div className="sm:col-span-2 space-y-1">
            <Label htmlFor="address">Physical Retail Address *</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => setFormData((p) => ({ ...p, address: e.target.value }))}
              required
            />
          </div>
        </div>
      </div>

      {/* 2. Configurable Delivery Charge Matrix */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100 flex items-center gap-2">
          <Truck className="h-4 w-4 text-emerald-600" /> Delivery Charge Matrix (BDT)
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="space-y-1">
            <Label htmlFor="insideDhaka">Inside Dhaka Delivery (BDT) *</Label>
            <Input
              id="insideDhaka"
              type="number"
              value={formData.defaultDeliveryInsideDhaka}
              onChange={(e) =>
                setFormData((p) => ({ ...p, defaultDeliveryInsideDhaka: parseFloat(e.target.value) || 0 }))
              }
              required
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="outsideDhaka">Outside Dhaka Delivery (BDT) *</Label>
            <Input
              id="outsideDhaka"
              type="number"
              value={formData.defaultDeliveryOutsideDhaka}
              onChange={(e) =>
                setFormData((p) => ({ ...p, defaultDeliveryOutsideDhaka: parseFloat(e.target.value) || 0 }))
              }
              required
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="freeThreshold">Free Shipping Threshold (BDT)</Label>
            <Input
              id="freeThreshold"
              type="number"
              value={formData.freeShippingThreshold}
              onChange={(e) =>
                setFormData((p) => ({ ...p, freeShippingThreshold: parseFloat(e.target.value) || 0 }))
              }
              required
            />
          </div>
        </div>
      </div>

      {/* 3. Pathao Courier API Keys Config (Environment Variable Secured) */}
      <div className="bg-slate-900 text-white p-6 rounded-2xl border border-slate-800 shadow-sm space-y-3 text-xs">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Key className="h-4 w-4 text-blue-400" /> Pathao Courier API Keys & Credentials
        </h3>
        <p className="text-slate-400 text-xs">
          API credentials are securely managed via server environment variables (<code>PATHAO_CLIENT_ID</code>, <code>PATHAO_CLIENT_SECRET</code>, <code>PATHAO_USERNAME</code>, <code>PATHAO_PASSWORD</code>, <code>PATHAO_STORE_ID</code>).
        </p>
        <div className="p-3 bg-slate-950 rounded-xl font-mono text-[11px] text-emerald-400 border border-slate-800">
          ✓ Provider: PathaoCourierProvider | Endpoint: {process.env.PATHAO_API_BASE_URL || "https://courier-api-sandbox.pathao.com"}
        </div>
      </div>

      {/* 4. Policy Text Editor */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 text-xs">
        <h3 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100 flex items-center gap-2">
          <Shield className="h-4 w-4 text-purple-600" /> Return & Warranty Policies
        </h3>

        <div className="space-y-3">
          <div className="space-y-1">
            <Label htmlFor="returnPolicy">7-Day Replacement & Return Policy</Label>
            <Textarea
              id="returnPolicy"
              rows={3}
              value={formData.returnPolicy}
              onChange={(e) => setFormData((p) => ({ ...p, returnPolicy: e.target.value }))}
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="shippingPolicy">Nationwide Shipping Policy</Label>
            <Textarea
              id="shippingPolicy"
              rows={3}
              value={formData.shippingPolicy}
              onChange={(e) => setFormData((p) => ({ ...p, shippingPolicy: e.target.value }))}
            />
          </div>
        </div>
      </div>
    </form>
  );
}
