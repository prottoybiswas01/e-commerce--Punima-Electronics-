"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/components/store/cart-provider";
import { formatPrice } from "@/lib/utils";
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
  DialogDescription,
} from "@/components/ui/dialog";
import {
  ShieldCheck,
  Truck,
  CreditCard,
  Banknote,
  CheckCircle2,
  Lock,
  ArrowRight,
  AlertCircle,
  Clock,
} from "lucide-react";
import { toast } from "sonner";

const BD_DIVISIONS = [
  "Dhaka",
  "Chittagong",
  "Sylhet",
  "Rajshahi",
  "Khulna",
  "Barishal",
  "Rangpur",
  "Mymensingh",
];

const DHAKA_THANA_LIST = [
  "Dhanmondi",
  "Gulshan",
  "Banani",
  "Uttara",
  "Mirpur",
  "Mohammadpur",
  "Elephant Road / New Market",
  "Motijheel",
  "Badda",
  "Khilgaon",
  "Tejgaon",
  "Malibagh",
  "Rampura",
  "Old Dhaka",
];

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, couponCode, couponDiscount, clearCart } = useCart();

  const [formData, setFormData] = useState({
    customerName: "",
    customerPhone: "",
    customerEmail: "",
    division: "Dhaka",
    district: "Dhaka",
    upazila: "Dhanmondi",
    area: "",
    addressLine: "",
    deliveryInstructions: "",
    orderNotes: "",
    paymentMethod: "COD" as "COD" | "BKASH" | "NAGAD" | "CARD",
  });

  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const isDhaka =
    formData.division.toLowerCase().includes("dhaka") ||
    formData.district.toLowerCase().includes("dhaka");

  const freeShippingThreshold = 5000;
  const isFreeShipping = subtotal >= freeShippingThreshold;
  const deliveryCharge = isFreeShipping ? 0 : isDhaka ? 70 : 130;
  const grandTotal = Math.max(0, subtotal - couponDiscount + deliveryCharge);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!formData.customerName.trim()) {
      toast.error("Please enter your full name");
      return;
    }
    if (!formData.customerPhone.trim() || formData.customerPhone.length < 11) {
      toast.error("Please enter a valid 11-digit Bangladeshi mobile number");
      return;
    }
    if (!formData.addressLine.trim()) {
      toast.error("Please enter your delivery street address");
      return;
    }

    setIsConfirmModalOpen(true);
  };

  const handleFinalOrderPlacement = async () => {
    setIsSubmitting(true);
    setErrorMsg("");

    try {
      const payload = {
        ...formData,
        couponCode: couponCode || undefined,
        items: items.map((i) => ({
          productId: i.productId,
          variantId: i.variantId || undefined,
          quantity: i.quantity,
        })),
      };

      const res = await fetch("/api/orders/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to place order");
      }

      toast.success(`Order placed successfully! #${data.orderNumber}`);
      clearCart();
      setIsConfirmModalOpen(false);
      router.push(`/order-success/${data.orderNumber}`);
    } catch (err: any) {
      setErrorMsg(err.message || "An unexpected error occurred.");
      toast.error(err.message || "Checkout failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center max-w-md">
        <h1 className="text-2xl font-extrabold text-slate-900">Your Cart is Empty</h1>
        <p className="text-sm text-slate-500 mt-2">
          Please add items to your cart before proceeding to checkout.
        </p>
        <Button className="mt-6" asChild>
          <Link href="/shop">Browse Products</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <div className="text-xs text-slate-500 font-medium">
            <Link href="/cart" className="hover:text-blue-600">Cart</Link> / <span>Checkout</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            Express Checkout
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Fill in your delivery details and choose your preferred payment method.
          </p>
        </div>

        <form onSubmit={handleFormSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left 2 Columns: Customer & Delivery Address Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Customer Contact Box */}
              <div className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 pb-3 border-b border-slate-100">
                  <span className="h-6 w-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold">1</span>
                  Customer Information
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="customerName">Full Name *</Label>
                    <Input
                      id="customerName"
                      name="customerName"
                      placeholder="e.g. Mahfuzur Rahman"
                      value={formData.customerName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="customerPhone">Mobile Number (11 digits) *</Label>
                    <Input
                      id="customerPhone"
                      name="customerPhone"
                      placeholder="01712345678"
                      value={formData.customerPhone}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="sm:col-span-2 space-y-1.5">
                    <Label htmlFor="customerEmail">Email Address (Optional for Invoice)</Label>
                    <Input
                      id="customerEmail"
                      name="customerEmail"
                      type="email"
                      placeholder="mahfuz@gmail.com"
                      value={formData.customerEmail}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              </div>

              {/* Delivery Address Box */}
              <div className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 pb-3 border-b border-slate-100">
                  <span className="h-6 w-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold">2</span>
                  Delivery Address & Zone
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="division">Division *</Label>
                    <select
                      id="division"
                      name="division"
                      value={formData.division}
                      onChange={handleInputChange}
                      className="w-full h-10 px-3 rounded-md border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                    >
                      {BD_DIVISIONS.map((div) => (
                        <option key={div} value={div}>{div}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="district">District / City *</Label>
                    <Input
                      id="district"
                      name="district"
                      placeholder="e.g. Dhaka"
                      value={formData.district}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="upazila">Thana / Upazila *</Label>
                    {formData.division === "Dhaka" ? (
                      <select
                        id="upazila"
                        name="upazila"
                        value={formData.upazila}
                        onChange={handleInputChange}
                        className="w-full h-10 px-3 rounded-md border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                      >
                        {DHAKA_THANA_LIST.map((th) => (
                          <option key={th} value={th}>{th}</option>
                        ))}
                      </select>
                    ) : (
                      <Input
                        id="upazila"
                        name="upazila"
                        placeholder="e.g. Kotwali / Sadar"
                        value={formData.upazila}
                        onChange={handleInputChange}
                        required
                      />
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="area">Area / Sector / Landmark (Optional)</Label>
                    <Input
                      id="area"
                      name="area"
                      placeholder="e.g. Sector 4, Road 7"
                      value={formData.area}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="sm:col-span-2 space-y-1.5">
                    <Label htmlFor="addressLine">Detailed Street Address / House / Flat *</Label>
                    <Textarea
                      id="addressLine"
                      name="addressLine"
                      rows={2}
                      placeholder="House #12, Road #4, Block B, Dhanmondi, Dhaka"
                      value={formData.addressLine}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="sm:col-span-2 space-y-1.5">
                    <Label htmlFor="deliveryInstructions">Delivery Instructions (Optional)</Label>
                    <Input
                      id="deliveryInstructions"
                      name="deliveryInstructions"
                      placeholder="e.g. Call before arrival, leave with security"
                      value={formData.deliveryInstructions}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              </div>

              {/* Payment Method Selector */}
              <div className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 pb-3 border-b border-slate-100">
                  <span className="h-6 w-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold">3</span>
                  Payment Method
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label
                    className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition ${
                      formData.paymentMethod === "COD"
                        ? "border-blue-600 bg-blue-50/50 ring-2 ring-blue-600/20"
                        : "border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="COD"
                      checked={formData.paymentMethod === "COD"}
                      onChange={handleInputChange}
                      className="mt-1"
                    />
                    <div>
                      <div className="flex items-center gap-1.5 font-bold text-sm text-slate-900">
                        <Banknote className="h-4 w-4 text-emerald-600" />
                        <span>Cash on Delivery (COD)</span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        Pay cash to Pathao delivery rider after receiving the product.
                      </p>
                    </div>
                  </label>

                  <label
                    className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition ${
                      formData.paymentMethod === "BKASH"
                        ? "border-rose-600 bg-rose-50/50 ring-2 ring-rose-600/20"
                        : "border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="BKASH"
                      checked={formData.paymentMethod === "BKASH"}
                      onChange={handleInputChange}
                      className="mt-1"
                    />
                    <div>
                      <div className="flex items-center gap-1.5 font-bold text-sm text-slate-900">
                        <CreditCard className="h-4 w-4 text-rose-600" />
                        <span>bKash / Nagad / Online</span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        Pay directly via Mobile Financial Services or Card.
                      </p>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* Right Column: Order Summary & Placement */}
            <div className="space-y-6">
              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4 sticky top-24">
                <h3 className="text-sm font-bold text-slate-900 pb-3 border-b border-slate-100">
                  Order Items ({items.length})
                </h3>

                {/* Items list */}
                <div className="space-y-3 max-h-60 overflow-y-auto pr-1 divide-y divide-slate-100">
                  {items.map((item) => (
                    <div key={item.id} className="pt-2 first:pt-0 flex gap-3 items-center text-xs">
                      <div className="relative h-12 w-12 rounded bg-slate-50 border shrink-0 overflow-hidden">
                        <Image src={item.image} alt={item.name} fill className="object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h5 className="font-semibold text-slate-900 truncate">{item.name}</h5>
                        <p className="text-[11px] text-slate-400">Qty: {item.quantity} × {formatPrice(item.price)}</p>
                      </div>
                      <div className="font-bold text-slate-900">
                        {formatPrice(item.price * item.quantity)}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Calculation breakdown */}
                <div className="border-t border-slate-200 pt-3 space-y-2 text-xs text-slate-600">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="font-semibold text-slate-900">{formatPrice(subtotal)}</span>
                  </div>

                  {couponDiscount > 0 && (
                    <div className="flex justify-between text-emerald-600 font-semibold">
                      <span>Coupon ({couponCode})</span>
                      <span>-{formatPrice(couponDiscount)}</span>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <span>Delivery ({isDhaka ? "Inside Dhaka" : "Outside Dhaka"})</span>
                    <span className="font-semibold text-slate-900">
                      {deliveryCharge === 0 ? "FREE" : formatPrice(deliveryCharge)}
                    </span>
                  </div>

                  <div className="pt-2 border-t border-slate-200 flex justify-between items-baseline">
                    <span className="text-sm font-bold text-slate-900">Total Payable</span>
                    <span className="text-xl font-extrabold text-blue-600">
                      {formatPrice(grandTotal)}
                    </span>
                  </div>
                </div>

                <Button
                  type="submit"
                  size="lg"
                  className="w-full bg-blue-600 hover:bg-blue-700 font-bold text-sm h-12 flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30"
                >
                  Confirm & Place Order <ArrowRight className="h-4 w-4" />
                </Button>

                <div className="text-[11px] text-slate-500 text-center space-y-1 pt-1">
                  <div className="flex items-center justify-center gap-1">
                    <Lock className="h-3 w-3 text-emerald-600" />
                    <span>SSL Encrypted Checkout</span>
                  </div>
                  <p>By placing order, you agree to our Terms & Warranty Policy.</p>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* Order Confirmation Modal */}
      <Dialog open={isConfirmModalOpen} onOpenChange={setIsConfirmModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-blue-600" /> Confirm Order Details
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Please double-check your delivery contact details before finalizing.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2 text-xs">
            <div className="bg-slate-50 p-3 rounded-lg border space-y-1">
              <div className="text-slate-500 font-medium">Recipient:</div>
              <div className="font-bold text-slate-900 text-sm">{formData.customerName}</div>
              <div className="font-bold text-slate-700">{formData.customerPhone}</div>
              <div className="text-slate-600 mt-1">
                {formData.addressLine}, {formData.upazila}, {formData.district}
              </div>
            </div>

            <div className="flex justify-between items-center bg-blue-50 p-3 rounded-lg border border-blue-200">
              <div>
                <div className="text-[11px] text-blue-800 font-medium">Payment Mode: {formData.paymentMethod}</div>
                <div className="text-sm font-extrabold text-blue-900">Total: {formatPrice(grandTotal)}</div>
              </div>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-1 rounded">
                Pathao Express
              </span>
            </div>

            {errorMsg && (
              <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-1.5">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              size="sm"
              disabled={isSubmitting}
              onClick={() => setIsConfirmModalOpen(false)}
            >
              Back / Edit
            </Button>
            <Button
              size="sm"
              disabled={isSubmitting}
              onClick={handleFinalOrderPlacement}
              className="bg-blue-600 hover:bg-blue-700 font-bold"
            >
              {isSubmitting ? "Placing Order..." : "Confirm & Submit"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
