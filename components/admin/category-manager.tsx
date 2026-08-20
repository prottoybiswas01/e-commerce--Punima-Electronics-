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
  Plus,
  Edit2,
  Trash2,
  ExternalLink,
  Layers,
  Sparkles,
  Tv,
  Smartphone,
  Laptop,
  Headphones,
  Refrigerator,
  Wind,
  Watch,
  Camera,
} from "lucide-react";
import { toast } from "sonner";

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  icon: string | null;
  isFeatured: boolean;
  displayOrder: number;
  _count: { products: number };
}

interface CategoryManagerProps {
  initialCategories: Category[];
}

export function CategoryManager({ initialCategories }: CategoryManagerProps) {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    image: "",
    icon: "Tv",
    isFeatured: false,
    displayOrder: 0,
  });

  const handleOpenCreate = () => {
    setSelectedCategory(null);
    setFormData({
      name: "",
      description: "",
      image: "https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=500",
      icon: "Tv",
      isFeatured: false,
      displayOrder: categories.length + 1,
    });
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (cat: Category) => {
    setSelectedCategory(cat);
    setFormData({
      name: cat.name,
      description: cat.description || "",
      image: cat.image || "",
      icon: cat.icon || "Tv",
      isFeatured: cat.isFeatured,
      displayOrder: cat.displayOrder,
    });
    setIsDialogOpen(true);
  };

  const handleOpenDelete = (cat: Category) => {
    setSelectedCategory(cat);
    setIsDeleteDialogOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error("Category name is required");
      return;
    }

    setIsSubmitting(true);
    try {
      if (selectedCategory) {
        // Edit existing
        const res = await fetch(`/api/admin/categories/${selectedCategory.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        const data = await res.json();
        if (data.success) {
          toast.success("Category updated successfully!");
          setIsDialogOpen(false);
          router.refresh();
        } else {
          toast.error(data.message || "Failed to update category");
        }
      } else {
        // Create new
        const res = await fetch("/api/admin/categories", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        const data = await res.json();
        if (data.success) {
          toast.success("Category created successfully!");
          setIsDialogOpen(false);
          router.refresh();
        } else {
          toast.error(data.message || "Failed to create category");
        }
      }
    } catch (e: any) {
      toast.error(e.message || "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedCategory) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/admin/categories/${selectedCategory.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Category deleted successfully!");
        setIsDeleteDialogOpen(false);
        router.refresh();
      } else {
        toast.error(data.message || "Failed to delete category");
      }
    } catch (e: any) {
      toast.error(e.message || "Failed to delete category");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Layers className="h-6 w-6 text-blue-600" />
            Categories Management
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Add new categories, edit storefront display orders, or remove obsolete categories.
          </p>
        </div>

        <Button onClick={handleOpenCreate} className="bg-blue-600 hover:bg-blue-700 font-bold text-xs shadow gap-1.5">
          <Plus className="h-4 w-4" /> Add New Category
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4 flex flex-col justify-between hover:shadow-md transition-shadow"
          >
            <div className="space-y-3">
              <div className="relative h-36 w-full rounded-xl overflow-hidden bg-slate-50 border">
                {cat.image ? (
                  <Image src={cat.image} alt={cat.name} fill className="object-cover" />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-slate-400 text-xs">
                    No Image
                  </div>
                )}
                <span className="absolute top-2 right-2 bg-slate-900/80 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-0.5 rounded">
                  Order #{cat.displayOrder}
                </span>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-900 text-base">{cat.name}</h3>
                  {cat.isFeatured && (
                    <span className="text-[10px] font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                      Featured
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 line-clamp-2 mt-1">
                  {cat.description || "No description provided."}
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">
                {cat._count.products} Products
              </span>

              <div className="flex items-center gap-1">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleOpenEdit(cat)}
                  className="h-8 px-2.5 text-xs text-slate-700 hover:text-blue-600 gap-1"
                >
                  <Edit2 className="h-3 w-3" /> Edit
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleOpenDelete(cat)}
                  className="h-8 px-2.5 text-xs text-rose-600 hover:bg-rose-50 border-rose-200"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
                <Button size="sm" variant="ghost" className="h-8 px-2 text-xs text-blue-600" asChild>
                  <a href={`/shop?category=${cat.slug}`} target="_blank" rel="noreferrer">
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create / Edit Modal */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>{selectedCategory ? "Edit Category" : "Add New Category"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold">Category Name *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Smart TV & Entertainment"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold">Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief category description for customer navigation"
                rows={2}
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold">Image URL (Unsplash or direct image)</Label>
              <Input
                value={formData.image}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                placeholder="https://images.unsplash.com/..."
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold">Display Order</Label>
                <Input
                  type="number"
                  value={formData.displayOrder}
                  onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value, 10) || 0 })}
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold">Icon Type</Label>
                <select
                  value={formData.icon}
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  className="w-full h-10 px-3 rounded-md border text-xs bg-white"
                >
                  <option value="Tv">TV & Audio (Tv)</option>
                  <option value="Smartphone">Smartphone (Smartphone)</option>
                  <option value="Laptop">Laptop & Computer (Laptop)</option>
                  <option value="Refrigerator">Home Appliance (Refrigerator)</option>
                  <option value="Wind">AC & Air Treatment (Wind)</option>
                  <option value="Headphones">Headphones & Audio (Headphones)</option>
                  <option value="Watch">Wearables (Watch)</option>
                  <option value="Camera">Camera (Camera)</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border">
              <div>
                <Label className="text-xs font-bold">Feature on Homepage</Label>
                <p className="text-[10px] text-slate-500">Show in homepage featured category cards</p>
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
                {isSubmitting ? "Saving..." : selectedCategory ? "Update Category" : "Create Category"}
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
              <Trash2 className="h-5 w-5" /> Delete Category?
            </DialogTitle>
          </DialogHeader>
          <div className="py-2 text-xs text-slate-600">
            Are you sure you want to permanently delete <strong>{selectedCategory?.name}</strong>?
            {selectedCategory?._count.products ? (
              <p className="mt-2 text-rose-600 font-semibold">
                ⚠️ This category currently has {selectedCategory._count.products} products assigned to it.
              </p>
            ) : null}
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
              {isSubmitting ? "Deleting..." : "Delete Permanently"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
