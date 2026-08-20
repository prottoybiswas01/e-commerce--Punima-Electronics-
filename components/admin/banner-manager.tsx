"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  Image as ImageIcon,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";

interface Banner {
  id: string;
  title: string;
  subtitle: string | null;
  ctaText: string | null;
  ctaLink: string;
  imageUrl: string;
  displayOrder: number;
  isActive: boolean;
}

interface BannerManagerProps {
  initialBanners: Banner[];
}

export function BannerManager({ initialBanners }: BannerManagerProps) {
  const router = useRouter();
  const [banners, setBanners] = useState<Banner[]>(initialBanners);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedBanner, setSelectedBanner] = useState<Banner | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    ctaText: "Shop Now",
    ctaLink: "/shop",
    imageUrl: "",
    displayOrder: 0,
    isActive: true,
  });

  const handleOpenCreate = () => {
    setSelectedBanner(null);
    setFormData({
      title: "",
      subtitle: "",
      ctaText: "Shop Now",
      ctaLink: "/shop",
      imageUrl: "https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=1600",
      displayOrder: banners.length + 1,
      isActive: true,
    });
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (banner: Banner) => {
    setSelectedBanner(banner);
    setFormData({
      title: banner.title,
      subtitle: banner.subtitle || "",
      ctaText: banner.ctaText || "Shop Now",
      ctaLink: banner.ctaLink,
      imageUrl: banner.imageUrl,
      displayOrder: banner.displayOrder,
      isActive: banner.isActive,
    });
    setIsDialogOpen(true);
  };

  const handleOpenDelete = (banner: Banner) => {
    setSelectedBanner(banner);
    setIsDeleteDialogOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.imageUrl.trim()) {
      toast.error("Banner title and image URL are required");
      return;
    }

    setIsSubmitting(true);
    try {
      if (selectedBanner) {
        const res = await fetch(`/api/admin/banners/${selectedBanner.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        const data = await res.json();
        if (data.success) {
          toast.success("Banner updated successfully!");
          setIsDialogOpen(false);
          router.refresh();
        } else {
          toast.error(data.message || "Failed to update banner");
        }
      } else {
        const res = await fetch("/api/admin/banners", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        const data = await res.json();
        if (data.success) {
          toast.success("Banner created successfully!");
          setIsDialogOpen(false);
          router.refresh();
        } else {
          toast.error(data.message || "Failed to create banner");
        }
      }
    } catch (e: any) {
      toast.error(e.message || "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedBanner) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/admin/banners/${selectedBanner.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Banner deleted successfully!");
        setIsDeleteDialogOpen(false);
        router.refresh();
      } else {
        toast.error(data.message || "Failed to delete banner");
      }
    } catch (e: any) {
      toast.error(e.message || "Failed to delete banner");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <ImageIcon className="h-6 w-6 text-blue-600" />
            Homepage Hero Banners
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure dynamic homepage hero promotional sliders, call-to-action buttons, and seasonal offers.
          </p>
        </div>

        <Button onClick={handleOpenCreate} className="bg-blue-600 hover:bg-blue-700 font-bold text-xs shadow gap-1.5">
          <Plus className="h-4 w-4" /> Add New Banner
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {banners.map((b) => (
          <div
            key={b.id}
            className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow"
          >
            <div>
              <div className="relative h-44 w-full bg-slate-900">
                <Image src={b.imageUrl} alt={b.title} fill className="object-cover opacity-90" />
                <span className="absolute top-2 left-2 bg-slate-900/80 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-0.5 rounded">
                  Slide #{b.displayOrder}
                </span>
                <span className={`absolute top-2 right-2 px-2 py-0.5 rounded text-[10px] font-bold ${
                  b.isActive ? "bg-emerald-500 text-white" : "bg-slate-700 text-slate-300"
                }`}>
                  {b.isActive ? "Active" : "Disabled"}
                </span>
              </div>

              <div className="p-5 space-y-2">
                <h3 className="font-bold text-slate-900 text-base">{b.title}</h3>
                {b.subtitle && <p className="text-xs text-slate-500">{b.subtitle}</p>}
                <div className="text-xs text-slate-400 font-mono pt-1">
                  CTA Link: <span className="text-blue-600 font-semibold">{b.ctaLink}</span> ({b.ctaText})
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
              <Button size="sm" variant="ghost" className="h-7 text-xs font-semibold text-slate-600" asChild>
                <a href={b.ctaLink} target="_blank" rel="noreferrer">
                  Preview CTA <ExternalLink className="h-3 w-3 ml-1" />
                </a>
              </Button>

              <div className="flex items-center gap-1">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleOpenEdit(b)}
                  className="h-8 px-2.5 text-xs text-slate-700 hover:text-blue-600 gap-1"
                >
                  <Edit2 className="h-3 w-3" /> Edit
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleOpenDelete(b)}
                  className="h-8 px-2.5 text-xs text-rose-600 hover:bg-rose-50 border-rose-200"
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
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{selectedBanner ? "Edit Banner" : "Add New Hero Banner"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold">Banner Headline / Title *</Label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. Next-Gen 4K OLED TVs with Official Warranty"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold">Subtitle / Promo Tagline</Label>
              <Input
                value={formData.subtitle}
                onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                placeholder="e.g. Save up to 25% this festive season"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold">Image URL (Desktop/Mobile Widescreen) *</Label>
              <Input
                value={formData.imageUrl}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                placeholder="https://images.unsplash.com/photo-..."
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold">Button Text</Label>
                <Input
                  value={formData.ctaText}
                  onChange={(e) => setFormData({ ...formData, ctaText: e.target.value })}
                  placeholder="e.g. Shop Now"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold">Button Link URL</Label>
                <Input
                  value={formData.ctaLink}
                  onChange={(e) => setFormData({ ...formData, ctaLink: e.target.value })}
                  placeholder="e.g. /shop or /product/slug"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 items-center">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold">Slide Display Order</Label>
                <Input
                  type="number"
                  value={formData.displayOrder}
                  onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value, 10) || 0 })}
                />
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border mt-3">
                <Label className="text-xs font-bold">Active Slide</Label>
                <Switch
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                />
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700">
                {isSubmitting ? "Saving..." : selectedBanner ? "Update Banner" : "Publish Banner"}
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
              <Trash2 className="h-5 w-5" /> Delete Banner?
            </DialogTitle>
          </DialogHeader>
          <div className="py-2 text-xs text-slate-600">
            Are you sure you want to remove the banner <strong>{selectedBanner?.title}</strong>?
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
              {isSubmitting ? "Deleting..." : "Delete Banner"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
