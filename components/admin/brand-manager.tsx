"use client";

import React, { useState } from "react";
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
import {
  Award,
  Plus,
  Edit2,
  Trash2,
  ExternalLink,
  Search,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";

interface Brand {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
  description: string | null;
  isFeatured: boolean;
  isActive: boolean;
  _count: { products: number };
}

interface BrandManagerProps {
  initialBrands: Brand[];
}

export function BrandManager({ initialBrands }: BrandManagerProps) {
  const router = useRouter();
  const [brands, setBrands] = useState<Brand[]>(initialBrands);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    logo: "",
    description: "",
    isFeatured: false,
  });

  const filteredBrands = brands.filter(
    (b) =>
      b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (b.description && b.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleOpenCreate = () => {
    setSelectedBrand(null);
    setFormData({
      name: "",
      logo: "",
      description: "",
      isFeatured: false,
    });
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (brand: Brand) => {
    setSelectedBrand(brand);
    setFormData({
      name: brand.name,
      logo: brand.logo || "",
      description: brand.description || "",
      isFeatured: brand.isFeatured,
    });
    setIsDialogOpen(true);
  };

  const handleOpenDelete = (brand: Brand) => {
    setSelectedBrand(brand);
    setIsDeleteDialogOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error("Brand name is required");
      return;
    }

    setIsSubmitting(true);
    try {
      if (selectedBrand) {
        const res = await fetch(`/api/admin/brands/${selectedBrand.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        const data = await res.json();
        if (data.success) {
          toast.success("Brand updated successfully!");
          setIsDialogOpen(false);
          router.refresh();
        } else {
          toast.error(data.message || "Failed to update brand");
        }
      } else {
        const res = await fetch("/api/admin/brands", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        const data = await res.json();
        if (data.success) {
          toast.success(`Brand "${formData.name}" added successfully!`);
          setIsDialogOpen(false);
          router.refresh();
        } else {
          toast.error(data.message || "Failed to create brand");
        }
      }
    } catch (e: any) {
      toast.error(e.message || "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedBrand) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/admin/brands/${selectedBrand.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Brand removed successfully!");
        setIsDeleteDialogOpen(false);
        router.refresh();
      } else {
        toast.error(data.message || "Failed to delete brand");
      }
    } catch (e: any) {
      toast.error(e.message || "Failed to delete brand");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Award className="h-6 w-6 text-blue-600" />
            Brand Management
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Add, edit, or delete manufacturers & supplier brands (TP-Link, Hikvision, Tenda, V-SOL, etc.).
          </p>
        </div>

        <Button onClick={handleOpenCreate} className="bg-blue-600 hover:bg-blue-700 font-bold text-xs shadow gap-1.5">
          <Plus className="h-4 w-4" /> Add New Brand
        </Button>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
        <div className="relative flex-1">
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search brands by name or equipment type..."
            className="h-10 text-xs pl-9"
          />
          <Search className="h-4 w-4 text-slate-400 absolute left-3 top-3" />
        </div>
        <div className="text-xs font-semibold text-slate-500 bg-slate-50 px-3 py-2 rounded-md border shrink-0">
          Showing <strong>{filteredBrands.length}</strong> of {brands.length} brands
        </div>
      </div>

      {/* Brands Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filteredBrands.map((brand) => (
          <div
            key={brand.id}
            className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4 flex flex-col justify-between hover:shadow-md transition-shadow"
          >
            <div className="space-y-3">
              <div className="relative h-24 w-full rounded-xl overflow-hidden bg-slate-50 border flex items-center justify-center p-3">
                {brand.logo ? (
                  <Image src={brand.logo} alt={brand.name} fill className="object-contain p-2" />
                ) : (
                  <div className="h-12 w-12 rounded-xl bg-blue-50 text-blue-700 font-extrabold flex items-center justify-center text-lg">
                    {brand.name.slice(0, 2).toUpperCase()}
                  </div>
                )}
                {brand.isFeatured && (
                  <span className="absolute top-2 right-2 bg-blue-600 text-white text-[9px] font-bold px-2 py-0.5 rounded shadow-sm">
                    Featured
                  </span>
                )}
              </div>

              <div>
                <h3 className="font-bold text-slate-900 text-base">{brand.name}</h3>
                <p className="text-xs text-slate-500 line-clamp-2 mt-1">
                  {brand.description || "Official brand hardware & accessories."}
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">
                {brand._count.products} Products
              </span>

              <div className="flex items-center gap-1">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleOpenEdit(brand)}
                  className="h-8 px-2.5 text-xs text-slate-700 hover:text-blue-600 gap-1"
                >
                  <Edit2 className="h-3 w-3" /> Edit
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleOpenDelete(brand)}
                  className="h-8 px-2 text-xs text-rose-600 hover:bg-rose-50 border-rose-200"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create / Edit Modal */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle>{selectedBrand ? "Edit Brand" : "Add New Brand"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold">Brand Name *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. TP-Link, Hikvision, V-SOL, Tenda"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold">Logo URL (Optional)</Label>
              <Input
                value={formData.logo}
                onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
                placeholder="https://..."
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold">Short Description / Equipment Type</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="e.g. High-performance WiFi routers, Mesh, and Gigabit Switches"
                rows={2}
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border">
              <div>
                <Label className="text-xs font-bold">Featured Brand</Label>
                <p className="text-[10px] text-slate-500">Showcase in brand filter and storefront headers</p>
              </div>
              <Switch
                checked={formData.isFeatured}
                onCheckedChange={(checked) => setFormData({ ...formData, isFeatured: checked })}
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700">
                {isSubmitting ? "Saving..." : selectedBrand ? "Update Brand" : "Create Brand"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="text-rose-600 flex items-center gap-2">
              <Trash2 className="h-5 w-5" /> Delete Brand?
            </DialogTitle>
          </DialogHeader>
          <div className="py-2 text-xs text-slate-600">
            Are you sure you want to delete brand <strong>{selectedBrand?.name}</strong>?
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Deleting..." : "Delete Brand"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
