"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { slugify } from "@/lib/utils";
import { Plus, Trash2, ArrowLeft, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";

interface ProductFormProps {
  initialData?: any;
  categories: Array<{ id: string; name: string }>;
  brands: Array<{ id: string; name: string }>;
}

export function ProductForm({ initialData, categories, brands }: ProductFormProps) {
  const router = useRouter();
  const isEditing = Boolean(initialData);

  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    slug: initialData?.slug || "",
    sku: initialData?.sku || "",
    categoryId: initialData?.categoryId || categories[0]?.id || "",
    brandId: initialData?.brandId || brands[0]?.id || "",
    description: initialData?.description || "",
    shortDescription: initialData?.shortDescription || "",
    price: initialData?.price || "",
    originalPrice: initialData?.originalPrice || "",
    discount: initialData?.discount || 0,
    costPrice: initialData?.costPrice || "",
    stock: initialData?.stock || 10,
    lowStockThreshold: initialData?.lowStockThreshold || 5,
    weight: initialData?.weight || 0.5,
    dimensions: initialData?.dimensions || "",
    tags: initialData?.tags || "",
    isFeatured: initialData?.isFeatured || false,
    isBestSeller: initialData?.isBestSeller || false,
    isNewArrival: initialData?.isNewArrival || false,
    isActive: initialData?.isActive !== false,
    seoTitle: initialData?.seoTitle || "",
    seoDescription: initialData?.seoDescription || "",
  });

  const [images, setImages] = useState<Array<{ url: string; altText?: string; isPrimary: boolean }>>(
    initialData?.images && initialData.images.length > 0
      ? initialData.images.map((img: any, idx: number) => ({
          url: img.url,
          altText: img.altText || "",
          isPrimary: idx === 0,
        }))
      : [
          {
            url: "https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=800",
            altText: "",
            isPrimary: true,
          },
        ]
  );

  const [imageUrlInput, setImageUrlInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setFormData((prev) => ({
      ...prev,
      name: val,
      slug: isEditing ? prev.slug : slugify(val),
    }));
  };

  const handleAddImage = () => {
    if (!imageUrlInput.trim()) return;
    setImages((prev) => [
      ...prev,
      { url: imageUrlInput.trim(), altText: formData.name, isPrimary: prev.length === 0 },
    ]);
    setImageUrlInput("");
  };

  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (images.length === 0) {
      toast.error("Please add at least one product image URL");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        ...formData,
        price: parseFloat(String(formData.price)),
        originalPrice: formData.originalPrice ? parseFloat(String(formData.originalPrice)) : null,
        discount: formData.discount ? parseFloat(String(formData.discount)) : 0,
        costPrice: formData.costPrice ? parseFloat(String(formData.costPrice)) : 0,
        stock: parseInt(String(formData.stock), 10),
        lowStockThreshold: parseInt(String(formData.lowStockThreshold), 10),
        weight: parseFloat(String(formData.weight)),
        images,
      };

      const url = isEditing
        ? `/api/admin/products/${initialData.id}`
        : "/api/admin/products";

      const res = await fetch(url, {
        method: isEditing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to save product");
      }

      toast.success(isEditing ? "Product updated successfully" : "Product created successfully");
      router.push("/admin/products");
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-5xl">
      {/* Action Header */}
      <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="text-xs font-semibold"
        >
          <ArrowLeft className="h-4 w-4 mr-1" /> Back to Products
        </Button>

        <div className="flex items-center gap-2">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="bg-blue-600 hover:bg-blue-700 font-bold text-xs shadow px-6"
          >
            {isSubmitting ? "Saving..." : isEditing ? "Update Product" : "Publish Product"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* General Info Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100">
              General Information
            </h3>

            <div className="space-y-1.5">
              <Label htmlFor="name">Product Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={handleNameChange}
                placeholder="e.g. Samsung 55 Inch Crystal 4K UHD Smart TV"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="slug">URL Slug *</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => setFormData((p) => ({ ...p, slug: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="sku">SKU Code *</Label>
                <Input
                  id="sku"
                  value={formData.sku}
                  onChange={(e) => setFormData((p) => ({ ...p, sku: e.target.value }))}
                  placeholder="SAM-TV-55CU7700"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="shortDescription">Short Highlights (1-2 lines)</Label>
              <Input
                id="shortDescription"
                value={formData.shortDescription}
                onChange={(e) => setFormData((p) => ({ ...p, shortDescription: e.target.value }))}
                placeholder="55 Inch 4K UHD, HDR10+, Tizen OS"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="description">Full Description & Overview *</Label>
              <Textarea
                id="description"
                rows={6}
                value={formData.description}
                onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
                placeholder="Detailed specifications, features, warranty details..."
                required
              />
            </div>
          </div>

          {/* Pricing & Cost Management */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100">
              Pricing & Cost (Profit Tracking)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="price">Selling Price (BDT) *</Label>
                <Input
                  id="price"
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData((p) => ({ ...p, price: e.target.value }))}
                  placeholder="58500"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="originalPrice">Compare Price / MRP (BDT)</Label>
                <Input
                  id="originalPrice"
                  type="number"
                  value={formData.originalPrice}
                  onChange={(e) => setFormData((p) => ({ ...p, originalPrice: e.target.value }))}
                  placeholder="65000"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="costPrice">Product Cost (BDT) - Secret</Label>
                <Input
                  id="costPrice"
                  type="number"
                  value={formData.costPrice}
                  onChange={(e) => setFormData((p) => ({ ...p, costPrice: e.target.value }))}
                  placeholder="49000"
                />
                <span className="text-[10px] text-slate-400">Used for net profit reports</span>
              </div>
            </div>
          </div>

          {/* Product Images Uploader */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100 flex items-center justify-between">
              <span>Product Image Gallery</span>
              <span className="text-xs text-slate-400 font-normal">{images.length} images added</span>
            </h3>

            <div className="flex gap-2">
              <Input
                placeholder="Paste high-res image URL (e.g. https://...)"
                value={imageUrlInput}
                onChange={(e) => setImageUrlInput(e.target.value)}
                className="text-xs"
              />
              <Button type="button" size="sm" onClick={handleAddImage} className="text-xs shrink-0">
                <Plus className="h-3.5 w-3.5 mr-1" /> Add Image
              </Button>
            </div>

            {/* Thumbnails preview */}
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 pt-2">
              {images.map((img, idx) => (
                <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border bg-slate-50 group">
                  <img src={img.url} alt="Product" className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(idx)}
                    className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 shadow hover:bg-red-700 transition"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                  {idx === 0 && (
                    <span className="absolute bottom-1 left-1 bg-blue-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                      Primary
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Col: Category, Brand, Inventory, Flags */}
        <div className="space-y-6">
          {/* Organization Card */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100">
              Organization
            </h3>

            <div className="space-y-1.5">
              <Label htmlFor="categoryId">Category *</Label>
              <select
                id="categoryId"
                value={formData.categoryId}
                onChange={(e) => setFormData((p) => ({ ...p, categoryId: e.target.value }))}
                className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-600"
                required
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="brandId">Brand</Label>
              <select
                id="brandId"
                value={formData.brandId}
                onChange={(e) => setFormData((p) => ({ ...p, brandId: e.target.value }))}
                className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                <option value="">No Brand</option>
                {brands.map((b) => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Inventory & Shipping Settings */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100">
              Inventory & Shipping (Pathao)
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="stock">Available Stock *</Label>
                <Input
                  id="stock"
                  type="number"
                  value={formData.stock}
                  onChange={(e) => setFormData((p) => ({ ...p, stock: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="lowStockThreshold">Low Threshold</Label>
                <Input
                  id="lowStockThreshold"
                  type="number"
                  value={formData.lowStockThreshold}
                  onChange={(e) => setFormData((p) => ({ ...p, lowStockThreshold: e.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="weight">Weight (KG) for Pathao *</Label>
              <Input
                id="weight"
                type="number"
                step="0.1"
                value={formData.weight}
                onChange={(e) => setFormData((p) => ({ ...p, weight: e.target.value }))}
                required
              />
            </div>
          </div>

          {/* Marketing & Merchandising Flags */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100">
              Merchandising Badges
            </h3>

            <div className="flex items-center justify-between">
              <Label htmlFor="isFeatured" className="text-xs cursor-pointer">Featured on Storefront</Label>
              <Switch
                id="isFeatured"
                checked={formData.isFeatured}
                onCheckedChange={(v) => setFormData((p) => ({ ...p, isFeatured: v }))}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="isBestSeller" className="text-xs cursor-pointer">Best Seller Badge</Label>
              <Switch
                id="isBestSeller"
                checked={formData.isBestSeller}
                onCheckedChange={(v) => setFormData((p) => ({ ...p, isBestSeller: v }))}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="isNewArrival" className="text-xs cursor-pointer">New Arrival Badge</Label>
              <Switch
                id="isNewArrival"
                checked={formData.isNewArrival}
                onCheckedChange={(v) => setFormData((p) => ({ ...p, isNewArrival: v }))}
              />
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
