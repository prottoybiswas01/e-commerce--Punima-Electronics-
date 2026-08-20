"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { formatPrice, formatDateTime } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Users,
  Search,
  Plus,
  Ban,
  CheckCircle2,
  Trash2,
  Phone,
  Mail,
  ShoppingBag,
} from "lucide-react";
import { toast } from "sonner";

interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  totalOrders: number;
  totalSpent: number;
  isBlocked: boolean;
  notes: string | null;
  createdAt: Date | string;
  _count: { orders: number };
}

interface CustomerManagerProps {
  initialCustomers: Customer[];
}

export function CustomerManager({ initialCustomers }: CustomerManagerProps) {
  const router = useRouter();
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    notes: "",
  });

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.includes(searchQuery) ||
      (c.email && c.email.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleOpenAdd = () => {
    setFormData({ name: "", phone: "", email: "", notes: "" });
    setIsAddOpen(true);
  };

  const handleOpenDelete = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsDeleteOpen(true);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.phone.trim()) {
      toast.error("Customer name and phone number are required");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/admin/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Customer ${formData.name} added successfully!`);
        setIsAddOpen(false);
        router.refresh();
      } else {
        toast.error(data.message || "Failed to add customer");
      }
    } catch (e: any) {
      toast.error(e.message || "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleBlock = async (customer: Customer) => {
    const newStatus = !customer.isBlocked;
    try {
      const res = await fetch(`/api/admin/customers/${customer.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isBlocked: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(newStatus ? `Customer ${customer.name} blocked` : `Customer ${customer.name} unblocked`);
        router.refresh();
      } else {
        toast.error(data.message || "Failed to update status");
      }
    } catch (e: any) {
      toast.error(e.message || "Failed to update status");
    }
  };

  const handleDelete = async () => {
    if (!selectedCustomer) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/admin/customers/${selectedCustomer.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Customer profile deleted successfully!");
        setIsDeleteOpen(false);
        router.refresh();
      } else {
        toast.error(data.message || "Failed to delete customer");
      }
    } catch (e: any) {
      toast.error(e.message || "Failed to delete customer");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Users className="h-6 w-6 text-blue-600" />
            Customer Management
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage registered clients, block fraudulent buyers, view lifetime revenue, and create customer records.
          </p>
        </div>

        <Button onClick={handleOpenAdd} className="bg-blue-600 hover:bg-blue-700 font-bold text-xs shadow gap-1.5">
          <Plus className="h-4 w-4" /> Add New Customer
        </Button>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
        <div className="relative flex-1">
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by customer name, phone number, email..."
            className="h-10 text-xs pl-9"
          />
          <Search className="h-4 w-4 text-slate-400 absolute left-3 top-3" />
        </div>
        <div className="text-xs font-semibold text-slate-500 bg-slate-50 px-3 py-2 rounded-md border shrink-0">
          Showing <strong>{filteredCustomers.length}</strong> of {customers.length}
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b">
              <tr>
                <th className="p-3.5">Customer Name</th>
                <th className="p-3.5">Phone Number</th>
                <th className="p-3.5">Email Address</th>
                <th className="p-3.5">Total Orders</th>
                <th className="p-3.5">Lifetime Spent</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5">Member Since</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400">
                    No customers found matching search criteria.
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/60 transition">
                    <td className="p-3.5 font-bold text-slate-900 flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-blue-100 text-blue-800 font-bold text-xs flex items-center justify-center shrink-0">
                        {c.name.slice(0, 1).toUpperCase()}
                      </div>
                      <div>
                        <div>{c.name}</div>
                        {c.notes && <div className="text-[10px] text-slate-400 font-normal">{c.notes}</div>}
                      </div>
                    </td>
                    <td className="p-3.5 font-mono font-semibold text-slate-700">{c.phone}</td>
                    <td className="p-3.5 text-slate-500">{c.email || "—"}</td>
                    <td className="p-3.5 font-bold text-slate-900">{c.totalOrders || c._count.orders}</td>
                    <td className="p-3.5 font-extrabold text-blue-600">{formatPrice(c.totalSpent)}</td>
                    <td className="p-3.5">
                      {c.isBlocked ? (
                        <span className="inline-flex items-center gap-1 bg-rose-50 text-rose-700 border border-rose-200 font-bold px-2 py-0.5 rounded text-[10px]">
                          <Ban className="h-3 w-3" /> Blocked
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold px-2 py-0.5 rounded text-[10px]">
                          <CheckCircle2 className="h-3 w-3" /> Active
                        </span>
                      )}
                    </td>
                    <td className="p-3.5 text-slate-400">{formatDateTime(c.createdAt)}</td>
                    <td className="p-3.5 text-right space-x-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleToggleBlock(c)}
                        className={`h-8 px-2.5 text-xs font-semibold ${
                          c.isBlocked
                            ? "text-emerald-700 border-emerald-200 hover:bg-emerald-50"
                            : "text-amber-700 border-amber-200 hover:bg-amber-50"
                        }`}
                      >
                        {c.isBlocked ? "Unblock" : "Block"}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleOpenDelete(c)}
                        className="h-8 px-2 text-xs text-rose-600 hover:bg-rose-50 border-rose-200"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Customer Modal */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle>Add New Customer Profile</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold">Full Name *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Tanvir Ahmed"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold">Phone Number *</Label>
              <Input
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="e.g. 01712345678"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold">Email Address</Label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="e.g. customer@gmail.com"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold">Internal Notes</Label>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Any special remarks or delivery preferences"
                rows={2}
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700">
                {isSubmitting ? "Creating..." : "Save Customer"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Customer Modal */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="text-rose-600 flex items-center gap-2">
              <Trash2 className="h-5 w-5" /> Delete Customer Profile?
            </DialogTitle>
          </DialogHeader>
          <div className="py-2 text-xs text-slate-600">
            Are you sure you want to permanently delete <strong>{selectedCustomer?.name}</strong> ({selectedCustomer?.phone})?
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsDeleteOpen(false)}>
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
