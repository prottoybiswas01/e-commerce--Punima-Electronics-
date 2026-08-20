import React from "react";
import { Badge } from "./badge";

export function OrderStatusBadge({ status }: { status: string }) {
  switch (status) {
    case "PENDING":
      return <Badge variant="warning">Pending Approval</Badge>;
    case "CONFIRMED":
      return <Badge variant="default">Confirmed</Badge>;
    case "PROCESSING":
      return <Badge variant="purple">Processing</Badge>;
    case "PACKED":
      return <Badge variant="purple">Packed</Badge>;
    case "COURIER_BOOKED":
      return <Badge className="bg-sky-600 text-white">Courier Booked</Badge>;
    case "PICKED_UP":
      return <Badge className="bg-indigo-600 text-white">Picked Up</Badge>;
    case "IN_TRANSIT":
      return <Badge className="bg-cyan-700 text-white animate-pulse">In Transit (Pathao)</Badge>;
    case "OUT_FOR_DELIVERY":
      return <Badge className="bg-amber-600 text-white">Out For Delivery</Badge>;
    case "DELIVERED":
      return <Badge variant="success">Delivered</Badge>;
    case "CANCELLED":
      return <Badge variant="destructive">Cancelled</Badge>;
    case "RETURN_REQUESTED":
      return <Badge variant="warning">Return Requested</Badge>;
    case "RETURNED":
      return <Badge variant="secondary">Returned</Badge>;
    case "REFUNDED":
      return <Badge variant="secondary">Refunded</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

export function PaymentStatusBadge({ status }: { status: string }) {
  switch (status) {
    case "PAID":
    case "SUCCESS":
      return <Badge variant="success">Paid</Badge>;
    case "PENDING":
      return <Badge variant="warning">Unpaid / COD</Badge>;
    case "FAILED":
      return <Badge variant="destructive">Failed</Badge>;
    case "REFUNDED":
      return <Badge variant="secondary">Refunded</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

export function StockStatusBadge({ stock, lowThreshold = 5 }: { stock: number; lowThreshold?: number }) {
  if (stock <= 0) {
    return <Badge variant="destructive">Out of Stock</Badge>;
  }
  if (stock <= lowThreshold) {
    return <Badge variant="warning">Low Stock ({stock} left)</Badge>;
  }
  return <Badge variant="success">In Stock ({stock})</Badge>;
}
