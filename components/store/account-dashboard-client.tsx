"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/auth-provider";
import { formatPrice, formatDateTime } from "@/lib/utils";
import { OrderStatusBadge, PaymentStatusBadge } from "@/components/ui/status-badge";
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
  User,
  ShoppingBag,
  MapPin,
  Heart,
  Star,
  LogOut,
  Plus,
  Trash2,
  Edit2,
  ExternalLink,
  Truck,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";

interface AccountDashboardClientProps {
  initialOrders?: any[];
  initialAddresses?: any[];
}

export function AccountDashboardClient({
  initialOrders = [],
  initialAddresses = [],
}: AccountDashboardClientProps) {
  const router = useRouter();
  const { user, customer, isLoading, logout, updateProfileDetails, refreshProfile } = useAuth();

  const [activeTab, setActiveTab] = useState<
    "overview" | "orders" | "addresses" | "wishlist" | "reviews"
  >("overview");

  // Profile Edit State
  const [nameInput, setNameInput] = useState(user?.displayName || customer?.name || "");
  const [phoneInput, setPhoneInput] = useState(customer?.phone || "");
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  // Address Modal State
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [addressForm, setAddressForm] = useState({
    title: "Home",
    recipientName: "",
    phone: "",
    division: "Dhaka",
    district: "Dhaka",
    upazila: "Elephant Road",
    area: "",
    addressLine: "",
    isDefault: true,
  });
  const [isSavingAddress, setIsSavingAddress] = useState(false);
  const [addresses, setAddresses] = useState<any[]>(customer?.addresses || initialAddresses);

  // Update local fields when user/customer loads
  React.useEffect(() => {
    if (user || customer) {
      setNameInput(user?.displayName || customer?.name || "");
      setPhoneInput(customer?.phone || "");
      if (customer?.addresses) {
        setAddresses(customer.addresses);
      }
    }
  }, [user, customer]);

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="h-8 w-8 rounded-full border-2 border-blue-600 border-t-transparent animate-spin mx-auto" />
          <p className="text-xs font-semibold text-slate-500">Loading your account...</p>
        </div>
      </div>
    );
  }

  if (!user && !customer) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200 p-8 text-center space-y-4 shadow-sm">
          <div className="h-12 w-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
            <User className="h-6 w-6" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Sign In to View Account</h2>
          <p className="text-xs text-slate-500">
            Please log in or create an account to view your past orders, delivery addresses, and warranty claims.
          </p>
          <div className="flex gap-3 pt-2">
            <Button asChild className="flex-1 bg-blue-600 hover:bg-blue-700 text-xs font-bold h-10">
              <Link href="/login?returnUrl=/account">Sign In</Link>
            </Button>
            <Button asChild variant="outline" className="flex-1 text-xs font-bold h-10">
              <Link href="/register?returnUrl=/account">Register</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingProfile(true);
    await updateProfileDetails(nameInput, phoneInput);
    setIsUpdatingProfile(false);
  };

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customer?.id) return;

    setIsSavingAddress(true);
    try {
      const res = await fetch("/api/user/addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...addressForm,
          customerId: customer.id,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to save address");
      }

      toast.success("New address saved!");
      setIsAddressModalOpen(false);
      await refreshProfile();
    } catch (err: any) {
      toast.error(err.message || "Error saving address");
    } finally {
      setIsSavingAddress(false);
    }
  };

  const handleDeleteAddress = async (id: string) => {
    try {
      const res = await fetch(`/api/user/addresses/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Address removed");
        setAddresses((prev) => prev.filter((a) => a.id !== id));
        await refreshProfile();
      }
    } catch (err) {
      toast.error("Failed to delete address");
    }
  };

  const orders = customer?.orders || initialOrders;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Profile Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col sm:flex-row justify-between sm:items-center gap-6">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-black text-2xl flex items-center justify-center shadow-lg shrink-0">
            {(user?.displayName || customer?.name || "U")[0].toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black tracking-tight">
                {user?.displayName || customer?.name || "Customer"}
              </h1>
              <span className="bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded">
                Verified Account
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">{user?.email}</p>
            <p className="text-[11px] text-slate-400 font-mono mt-0.5">
              Phone: {customer?.phone || "Not set"}
            </p>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={logout}
          className="text-xs font-bold text-slate-200 border-slate-700 bg-slate-800/60 hover:bg-slate-800 self-start sm:self-auto"
        >
          <LogOut className="h-4 w-4 mr-1.5" /> Sign Out
        </Button>
      </div>

      {/* Main Grid: Sidebar Tabs + Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Nav Tabs */}
        <div className="space-y-1 bg-white p-3 rounded-2xl border border-slate-200 shadow-sm h-fit">
          <button
            onClick={() => setActiveTab("overview")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition text-left ${
              activeTab === "overview"
                ? "bg-blue-600 text-white shadow-sm"
                : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            <User className="h-4 w-4" /> Profile Information
          </button>

          <button
            onClick={() => setActiveTab("orders")}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold transition text-left ${
              activeTab === "orders"
                ? "bg-blue-600 text-white shadow-sm"
                : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            <span className="flex items-center gap-3">
              <ShoppingBag className="h-4 w-4" /> My Orders
            </span>
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded font-extrabold ${
                activeTab === "orders" ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"
              }`}
            >
              {orders.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("addresses")}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold transition text-left ${
              activeTab === "addresses"
                ? "bg-blue-600 text-white shadow-sm"
                : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            <span className="flex items-center gap-3">
              <MapPin className="h-4 w-4" /> Saved Addresses
            </span>
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded font-extrabold ${
                activeTab === "addresses" ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"
              }`}
            >
              {addresses.length}
            </span>
          </button>
        </div>

        {/* Right Content Panels */}
        <div className="lg:col-span-3 space-y-6">
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* Stats Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
                  <span className="text-xs font-semibold text-slate-500">Total Purchases</span>
                  <div className="text-2xl font-black text-slate-900">
                    {formatPrice(customer?.totalSpent || 0)}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Across {customer?.totalOrders || orders.length} completed orders
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
                  <span className="text-xs font-semibold text-slate-500">Account Security</span>
                  <div className="text-sm font-bold text-emerald-600 flex items-center gap-1.5 pt-1">
                    <ShieldCheck className="h-4 w-4" /> Firebase Protected
                  </div>
                  <div className="text-[11px] text-slate-400">Email: {user?.email}</div>
                </div>
              </div>

              {/* Edit Profile Form */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100">
                  Update Personal Information
                </h3>

                <form onSubmit={handleUpdateProfile} className="space-y-4 max-w-lg">
                  <div className="space-y-1.5">
                    <Label htmlFor="profName" className="text-xs font-semibold">
                      Full Name
                    </Label>
                    <Input
                      id="profName"
                      value={nameInput}
                      onChange={(e) => setNameInput(e.target.value)}
                      className="h-10 text-xs"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="profPhone" className="text-xs font-semibold">
                      Mobile Phone Number
                    </Label>
                    <Input
                      id="profPhone"
                      value={phoneInput}
                      onChange={(e) => setPhoneInput(e.target.value)}
                      placeholder="01712345678"
                      className="h-10 text-xs font-mono"
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={isUpdatingProfile}
                    className="bg-blue-600 hover:bg-blue-700 font-bold text-xs shadow"
                  >
                    {isUpdatingProfile ? "Saving changes..." : "Save Profile"}
                  </Button>
                </form>
              </div>
            </div>
          )}

          {activeTab === "orders" && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-6 space-y-4">
              <h3 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100 flex justify-between items-center">
                <span>My Lifetime Orders ({orders.length})</span>
                <span className="text-xs text-slate-400 font-normal">Authentic products with official warranty</span>
              </h3>

              {orders.length === 0 ? (
                <div className="text-center py-12 space-y-3">
                  <div className="h-12 w-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                    <ShoppingBag className="h-6 w-6" />
                  </div>
                  <h4 className="font-bold text-slate-800 text-sm">No Orders Yet</h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    You haven't placed any orders yet. Discover high-quality electronics on our shop!
                  </p>
                  <Button asChild className="bg-blue-600 hover:bg-blue-700 font-bold text-xs">
                    <Link href="/shop">Start Shopping</Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((o: any) => (
                    <div
                      key={o.id}
                      className="border border-slate-200 rounded-2xl p-4 sm:p-5 hover:border-slate-300 transition space-y-3"
                    >
                      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 pb-2 border-b border-slate-100 text-xs">
                        <div>
                          <span className="font-bold text-slate-900 font-mono text-sm">
                            #{o.orderNumber}
                          </span>
                          <span className="text-slate-400 ml-2">
                            Placed on {formatDateTime(o.createdAt)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <OrderStatusBadge status={o.orderStatus} />
                          <PaymentStatusBadge status={o.paymentStatus} />
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 text-xs">
                        <div className="space-y-0.5">
                          <div className="font-semibold text-slate-700">
                            Total: <strong className="text-slate-900 text-sm">{formatPrice(o.totalAmount)}</strong>
                          </div>
                          <div className="text-[11px] text-slate-400">
                            Delivery to: {o.addressLine}, {o.district}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="outline" className="h-8 text-xs font-bold" asChild>
                            <Link href={`/track-order?orderNumber=${o.orderNumber}`}>
                              <Truck className="h-3.5 w-3.5 mr-1" /> Track Delivery
                            </Link>
                          </Button>
                          <Button size="sm" variant="outline" className="h-8 text-xs font-bold" asChild>
                            <Link href={`/order-success/${o.orderNumber}`}>
                              Invoice <ExternalLink className="h-3 w-3 ml-1" />
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "addresses" && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-900">Saved Shipping Addresses</h3>
                <Button
                  size="sm"
                  onClick={() => setIsAddressModalOpen(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-xs font-bold h-8"
                >
                  <Plus className="h-3.5 w-3.5 mr-1" /> Add New Address
                </Button>
              </div>

              {addresses.length === 0 ? (
                <div className="text-center py-8 space-y-2">
                  <p className="text-xs text-slate-400">No saved addresses yet.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {addresses.map((addr: any) => (
                    <div
                      key={addr.id}
                      className="border border-slate-200 rounded-2xl p-4 space-y-2 text-xs relative group bg-slate-50/50"
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-slate-900">{addr.title}</span>
                        {addr.isDefault && (
                          <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded">
                            Default
                          </span>
                        )}
                      </div>

                      <div className="font-semibold text-slate-800">{addr.recipientName}</div>
                      <div className="text-slate-500 font-mono text-[11px]">{addr.phone}</div>
                      <div className="text-slate-600 pt-1">
                        {addr.addressLine}, {addr.upazila}, {addr.district}, {addr.division}
                      </div>

                      <div className="pt-2 flex justify-end">
                        <button
                          onClick={() => handleDeleteAddress(addr.id)}
                          className="text-red-500 hover:text-red-700 text-[11px] font-semibold flex items-center gap-1"
                        >
                          <Trash2 className="h-3 w-3" /> Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Add Address Modal */}
      <Dialog open={isAddressModalOpen} onOpenChange={setIsAddressModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">Add Delivery Address</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSaveAddress} className="space-y-3 py-2 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="addrTitle">Address Label</Label>
                <select
                  id="addrTitle"
                  value={addressForm.title}
                  onChange={(e) => setAddressForm((p) => ({ ...p, title: e.target.value }))}
                  className="w-full h-9 px-3 rounded-md border border-slate-200 text-xs"
                >
                  <option value="Home">Home</option>
                  <option value="Office">Office</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="space-y-1">
                <Label htmlFor="recName">Recipient Name *</Label>
                <Input
                  id="recName"
                  value={addressForm.recipientName}
                  onChange={(e) => setAddressForm((p) => ({ ...p, recipientName: e.target.value }))}
                  placeholder="Tanvir Ahmed"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="recPhone">Phone Number *</Label>
              <Input
                id="recPhone"
                type="tel"
                value={addressForm.phone}
                onChange={(e) => setAddressForm((p) => ({ ...p, phone: e.target.value }))}
                placeholder="01712345678"
                className="font-mono"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="division">Division</Label>
                <Input
                  id="division"
                  value={addressForm.division}
                  onChange={(e) => setAddressForm((p) => ({ ...p, division: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="district">District</Label>
                <Input
                  id="district"
                  value={addressForm.district}
                  onChange={(e) => setAddressForm((p) => ({ ...p, district: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="addrLine">Street Address / House / Road *</Label>
              <Input
                id="addrLine"
                value={addressForm.addressLine}
                onChange={(e) => setAddressForm((p) => ({ ...p, addressLine: e.target.value }))}
                placeholder="House 14, Road 5, Block B, Dhanmondi"
                required
              />
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsAddressModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={isSavingAddress}
                className="bg-blue-600 hover:bg-blue-700 font-bold"
              >
                {isSavingAddress ? "Saving..." : "Save Address"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
