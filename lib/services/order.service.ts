import prisma from "@/lib/prisma";
import { generateOrderNumber } from "@/lib/utils";
import { validateAndCalculateCoupon } from "./coupon.service";
import { adjustInventoryStock } from "./inventory.service";
import { CheckoutFormValues } from "@/lib/validators";

export async function createOrder(data: CheckoutFormValues, customerId?: string) {
  return await prisma.$transaction(async (tx) => {
    // 1. Fetch products & variants to calculate verified server prices and check stock
    const productIds = data.items.map((i) => i.productId);
    const products = await tx.product.findMany({
      where: { id: { in: productIds }, isActive: true },
      include: { variants: true },
    });

    const productMap = new Map(products.map((p) => [p.id, p]));

    let calculatedSubtotal = 0;
    const verifiedOrderItems: Array<{
      productId: string;
      variantId?: string | null;
      productName: string;
      variantName?: string | null;
      sku: string;
      quantity: number;
      unitPrice: number;
      costPrice: number;
      totalPrice: number;
    }> = [];

    for (const item of data.items) {
      const product = productMap.get(item.productId);
      if (!product) {
        throw new Error(`Product not found or unavailable (ID: ${item.productId})`);
      }

      let unitPrice = product.price;
      let costPrice = product.costPrice || 0;
      let sku = product.sku;
      let variantName: string | null = null;
      let availableStock = product.stock;

      if (item.variantId) {
        const variant = product.variants.find((v) => v.id === item.variantId);
        if (!variant) {
          throw new Error(`Variant not found for product "${product.name}"`);
        }
        unitPrice = variant.price;
        costPrice = variant.costPrice || costPrice;
        sku = variant.sku;
        variantName = variant.name;
        availableStock = variant.stock;
      }

      if (availableStock < item.quantity) {
        throw new Error(`Insufficient stock for "${product.name}". Available: ${availableStock}, Requested: ${item.quantity}`);
      }

      const itemTotal = unitPrice * item.quantity;
      calculatedSubtotal += itemTotal;

      verifiedOrderItems.push({
        productId: product.id,
        variantId: item.variantId || null,
        productName: product.name,
        variantName,
        sku,
        quantity: item.quantity,
        unitPrice,
        costPrice,
        totalPrice: itemTotal,
      });
    }

    // 2. Validate Coupon server-side
    let couponDiscount = 0;
    let freeShipping = false;
    let validatedCouponId: string | null = null;

    if (data.couponCode && data.couponCode.trim()) {
      const couponRes = await validateAndCalculateCoupon(data.couponCode, calculatedSubtotal, customerId);
      if (couponRes.isValid) {
        couponDiscount = couponRes.discountAmount;
        freeShipping = couponRes.freeShipping;
        validatedCouponId = couponRes.coupon?.id || null;
      }
    }

    // 3. Determine Delivery Fee
    const isDhaka =
      data.division.toLowerCase().includes("dhaka") ||
      data.district.toLowerCase().includes("dhaka");
    
    // Check free shipping threshold
    const settings = await tx.storeSettings.findFirst();
    const freeShippingThreshold = settings?.freeShippingThreshold ?? 5000;
    
    let deliveryCharge = isDhaka
      ? (settings?.defaultDeliveryInsideDhaka ?? 70)
      : (settings?.defaultDeliveryOutsideDhaka ?? 130);

    if (freeShipping || (freeShippingThreshold > 0 && calculatedSubtotal >= freeShippingThreshold)) {
      deliveryCharge = 0;
    }

    // 4. Calculate Final Total
    const grandTotal = Math.max(0, calculatedSubtotal - couponDiscount + deliveryCharge);
    const orderNumber = generateOrderNumber();

    // 5. Create or Find Customer
    let resolvedCustomerId = customerId;
    if (!resolvedCustomerId && data.customerPhone) {
      let customer = await tx.customer.findUnique({
        where: { phone: data.customerPhone },
      });

      if (!customer) {
        customer = await tx.customer.create({
          data: {
            name: data.customerName,
            phone: data.customerPhone,
            email: data.customerEmail || null,
          },
        });
      }
      resolvedCustomerId = customer.id;
    }

    // 6. Create Order in Database
    const order = await tx.order.create({
      data: {
        orderNumber,
        customerId: resolvedCustomerId,
        customerName: data.customerName,
        customerPhone: data.customerPhone,
        customerEmail: data.customerEmail || null,
        division: data.division,
        district: data.district,
        upazila: data.upazila,
        area: data.area || null,
        addressLine: data.addressLine,
        deliveryInstructions: data.deliveryInstructions || null,
        orderNotes: data.orderNotes || null,
        subtotal: calculatedSubtotal,
        discountAmount: 0,
        couponDiscount,
        couponCode: validatedCouponId ? data.couponCode?.toUpperCase() : null,
        deliveryCharge,
        totalAmount: grandTotal,
        paymentMethod: data.paymentMethod || "COD",
        paymentStatus: data.paymentMethod === "COD" ? "PENDING" : "PENDING",
        orderStatus: "PENDING",
        items: {
          create: verifiedOrderItems.map((item) => ({
            productId: item.productId,
            variantId: item.variantId,
            productName: item.productName,
            variantName: item.variantName,
            sku: item.sku,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            costPrice: item.costPrice,
            totalPrice: item.totalPrice,
          })),
        },
        timeline: {
          create: {
            status: "PENDING",
            title: "Order Placed",
            description: `Order successfully placed by ${data.customerName}. Payment method: ${data.paymentMethod}`,
            createdBy: "Customer",
          },
        },
      },
      include: {
        items: true,
      },
    });

    // 7. Deduct Inventory & Record Stock Ledger
    for (const item of verifiedOrderItems) {
      await adjustInventoryStock({
        productId: item.productId,
        variantId: item.variantId,
        changeQuantity: -item.quantity,
        reason: "SALE",
        notes: `Order placed: #${orderNumber}`,
        createdBy: "System",
      });
    }

    // 8. Record Coupon Usage
    if (validatedCouponId) {
      await tx.couponUsage.create({
        data: {
          couponId: validatedCouponId,
          orderId: order.id,
          customerId: resolvedCustomerId,
          discountApplied: couponDiscount,
        },
      });

      await tx.coupon.update({
        where: { id: validatedCouponId },
        data: { usageCount: { increment: 1 } },
      });
    }

    // 9. Update Customer Stats
    if (resolvedCustomerId) {
      await tx.customer.update({
        where: { id: resolvedCustomerId },
        data: {
          totalOrders: { increment: 1 },
          totalSpent: { increment: grandTotal },
        },
      });
    }

    // 10. Generate Notification for Admins
    await tx.notification.create({
      data: {
        type: "NEW_ORDER",
        title: `New Order: #${orderNumber}`,
        message: `${data.customerName} placed an order worth ৳${grandTotal.toLocaleString("en-BD")}.`,
        link: `/admin/orders/${order.id}`,
      },
    });

    return order;
  });
}

export async function updateOrderStatus(
  orderId: string,
  newStatus: string,
  adminUser: { name: string; email: string },
  note?: string
) {
  return await prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });

    if (!order) throw new Error("Order not found");
    const oldStatus = order.orderStatus;

    if (oldStatus === newStatus) return order;

    // Handle inventory restock if cancelled
    if (newStatus === "CANCELLED" && !order.isCancelled) {
      for (const item of order.items) {
        await adjustInventoryStock({
          productId: item.productId,
          variantId: item.variantId,
          changeQuantity: item.quantity,
          reason: "RETURN",
          notes: `Restock from cancelled order #${order.orderNumber}`,
          createdBy: adminUser.name,
        });
      }
    }

    const updated = await tx.order.update({
      where: { id: orderId },
      data: {
        orderStatus: newStatus,
        isCancelled: newStatus === "CANCELLED",
        cancelledAt: newStatus === "CANCELLED" ? new Date() : undefined,
        isDelivered: newStatus === "DELIVERED",
        deliveredAt: newStatus === "DELIVERED" ? new Date() : undefined,
        isPaid: newStatus === "DELIVERED" || order.isPaid,
        paidAt: newStatus === "DELIVERED" && !order.isPaid ? new Date() : order.paidAt,
        paymentStatus: newStatus === "DELIVERED" ? "PAID" : order.paymentStatus,
      },
    });

    await tx.orderTimeline.create({
      data: {
        orderId,
        status: newStatus,
        title: `Status changed to ${newStatus.replace(/_/g, " ")}`,
        description: note || `Order updated by ${adminUser.name}`,
        createdBy: adminUser.name,
      },
    });

    await tx.auditLog.create({
      data: {
        userName: adminUser.name,
        action: "UPDATE_ORDER_STATUS",
        entity: "Order",
        entityId: order.id,
        previousState: JSON.stringify({ status: oldStatus }),
        newState: JSON.stringify({ status: newStatus, note }),
      },
    });

    return updated;
  });
}
