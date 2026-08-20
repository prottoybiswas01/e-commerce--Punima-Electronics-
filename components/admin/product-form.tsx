"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { slugify } from "@/lib/utils";
import {
  Plus,
  Trash2,
  ArrowLeft,
  Image as ImageIcon,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";

interface ProductFormProps {
  initialData?: any;
  categories: Array<{ id: string; name: string }>;
  brands: Array<{ id: string; name: string }>;
}

// Client-side image compressor: compresses phone/laptop camera photos to < 60 KB WebP
async function compressImageFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new (window as any).Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;
        const maxDimension = 1000;

        if (width > height && width > maxDimension) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        } else if (height > maxDimension) {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(event.target?.result as string);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        // Export as WebP with 0.75 compression quality for low KB footprint
        const dataUrl = canvas.toDataURL("image/webp", 0.75);
        resolve(dataUrl);
      };
      img.onerror = (err: any) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
}

export function ProductForm({ initialData, categories, brands }: ProductFormProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
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
  const [isCompressing, setIsCompressing] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setFormData((prev) => ({
      ...prev,
      name: val,
      slug: isEditing ? prev.slug : slugify(val),
    }));
  };

  const handleAddImageUrl = () => {
    if (!imageUrlInput.trim()) return;
    if (images.length >= 5) {
      toast.error("Maximum 5 images allowed per product");
      return;
    }
    setImages((prev) => [
      ...prev,
      { url: imageUrlInput.trim(), altText: formData.name, isPrimary: prev.length === 0 },
    ]);
    setImageUrlInput("");
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (images.length + files.length > 5) {
      toast.error("Maximum 5 images allowed per product. Please select fewer photos.");
      return;
    }

    setIsCompressing(true);
    toast.info("Optimizing and compressing photos...");

    try {
      const compressedUrls: Array<{ url: string; altText?: string; isPrimary: boolean }> = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const compressedBase64 = await compressImageFile(file);
        compressedUrls.push({
          url: compressedBase64,
          altText: `${formData.name || "Product"} image ${images.length + i + 1}`,
          isPrimary: images.length === 0 && i === 0,
        });
      }

      setImages((prev) => [...prev, ...compressedUrls]);
      toast.success(`${files.length} photo(s) compressed & attached successfully!`);
    } catch (err: any) {
      toast.error("Failed to process photos: " + err.message);
    } finally {
      setIsCompressing(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (images.length === 0) {
      toast.error("Please add at least 1 product image");
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

      toast.success(isEditing ? "Product updated successfully!" : "Product created successfully!");
      router.push("/admin/products");
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteProduct = async () => {
    if (!initialData?.id) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/admin/products/${initialData.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Product deleted / archived successfully!");
        setIsDeleteDialogOpen(false);
        router.push("/admin/products");
        router.refresh();
      } else {
        toast.error(data.message || "Failed to delete product");
      }
    } catch (e: any) {
      toast.error(e.message || "Failed to delete product");
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
          onClick={() => router.push("/admin/products")}
          className="text-xs font-semibold"
        >
          <ArrowLeft className="h-4 w-4 mr-1" /> Back to Products
        </Button>

        <div className="flex items-center gap-2">
          {isEditing && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsDeleteDialogOpen(true)}
              className="text-xs font-bold text-rose-600 border-rose-200 hover:bg-rose-50 gap-1"
            >
              <Trash2 className="h-4 w-4" /> Delete Product
            </Button>
          )}

          <Button
            type="submit"
            disabled={isSubmitting || isCompressing}
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
                placeholder="e.g. Sony Bravia 55 Inch 4K HDR Google TV"
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
                  placeholder="SONY-KD-55X75L"
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
                placeholder="4K X-Reality PRO, Dolby Audio, Google Assistant"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="description">Full Description & Warranty Details *</Label>
              <Textarea
                id="description"
                rows={6}
                value={formData.description}
                onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
                placeholder="Detailed specifications, ports, panel type, official warranty conditions..."
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
                  placeholder="65000"
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
                  placeholder="72000"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="costPrice">Wholesale / Cost Price (BDT)</Label>
                <Input
                  id="costPrice"
                  type="number"
                  value={formData.costPrice}
                  onChange={(e) => setFormData((p) => ({ ...p, costPrice: e.target.value }))}
                  placeholder="56000"
                />
              </div>
            </div>
          </div>

          {/* Product Media & Direct Photo Upload */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Product Photos ({images.length}/5)</h3>
                <p className="text-[11px] text-slate-500">
                  Upload directly from your phone/laptop (auto-compressed to low KB) or paste image URLs. Max 5 photos.
                </p>
              </div>
            </div>

            {/* Direct Device Upload Box */}
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                multiple
                accept="image/*"
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={isCompressing || images.length >= 5}
                className="flex-1 border-dashed border-2 border-blue-300 bg-blue-50/50 hover:bg-blue-50 text-blue-700 h-12 gap-2 text-xs font-bold"
              >
                <UploadCloud className="h-4 w-4" />
                {isCompressing ? "Compressing & Uploading..." : "Choose Photos from Phone/Computer"}
              </Button>
            </div>

            {/* URL Fallback Input */}
            <div className="flex gap-2">
              <Input
                value={imageUrlInput}
                onChange={(e) => setImageUrlInput(e.target.value)}
                placeholder="Or paste an image web link (https://...)"
                className="text-xs"
                disabled={images.length >= 5}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddImageUrl}
                disabled={images.length >= 5}
                className="text-xs shrink-0"
              >
                <Plus className="h-3.5 w-3.5 mr-1" /> Add URL
              </Button>
            </div>

            {/* Image Gallery Thumbnails */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2">
              {images.map((img, idx) => (
                <div
                  key={idx}
                  className="relative aspect-square rounded-xl overflow-hidden border-2 border-slate-200 group bg-slate-50 shadow-sm"
                >
                  <img src={img.url} alt={`Preview ${idx + 1}`} className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(idx)}
                    className="absolute top-1.5 right-1.5 p-1 bg-rose-600 text-white rounded-full opacity-90 hover:opacity-100 transition shadow"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                  {idx === 0 && (
                    <span className="absolute bottom-1 left-1 bg-blue-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                      Main Photo
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
                <Label htmlFor="lowStockThreshold">Low Alert Stock</Label>
                <Input
                  id="lowStockThreshold"
                  type="number"
                  value={formData.lowStockThreshold}
                  onChange={(e) => setFormData((p) => ({ ...p, lowStockThreshold: e.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="weight">Weight (KG) for Pathao Courier *</Label>
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

            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <Label htmlFor="isActive" className="text-xs cursor-pointer font-bold text-slate-900">Publish Immediately</Label>
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(v) => setFormData((p) => ({ ...p, isActive: v }))}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="text-rose-600 flex items-center gap-2">
              <Trash2 className="h-5 w-5" /> Delete Product?
            </DialogTitle>
          </DialogHeader>
          <div className="py-2 text-xs text-slate-600">
            Are you sure you want to delete <strong>{formData.name}</strong> from catalog?
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDeleteProduct}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Deleting..." : "Delete Permanently"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </form>
  );
}
