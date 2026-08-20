import prisma from "@/lib/prisma";

export interface CouponValidationResult {
  isValid: boolean;
  message?: string;
  discountAmount: number;
  freeShipping: boolean;
  coupon?: {
    id: string;
    code: string;
    type: string;
    value: number;
  };
}

export async function validateAndCalculateCoupon(
  code: string,
  subtotal: number,
  customerId?: string
): Promise<CouponValidationResult> {
  if (!code || !code.trim()) {
    return { isValid: false, discountAmount: 0, freeShipping: false, message: "No coupon provided" };
  }

  const cleanCode = code.trim().toUpperCase();
  const coupon = await prisma.coupon.findUnique({
    where: { code: cleanCode },
  });

  if (!coupon) {
    return { isValid: false, discountAmount: 0, freeShipping: false, message: "Invalid coupon code" };
  }

  if (!coupon.isActive) {
    return { isValid: false, discountAmount: 0, freeShipping: false, message: "This coupon is no longer active" };
  }

  const now = new Date();
  if (coupon.startDate && new Date(coupon.startDate) > now) {
    return { isValid: false, discountAmount: 0, freeShipping: false, message: "This coupon is not yet valid" };
  }

  if (coupon.endDate && new Date(coupon.endDate) < now) {
    return { isValid: false, discountAmount: 0, freeShipping: false, message: "This coupon has expired" };
  }

  if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
    return { isValid: false, discountAmount: 0, freeShipping: false, message: "This coupon usage limit has been reached" };
  }

  if (coupon.minOrderAmount > 0 && subtotal < coupon.minOrderAmount) {
    return {
      isValid: false,
      discountAmount: 0,
      freeShipping: false,
      message: `Minimum order amount for this coupon is ৳${coupon.minOrderAmount}`,
    };
  }

  if (customerId && coupon.perCustomerLimit) {
    const customerUsageCount = await prisma.couponUsage.count({
      where: {
        couponId: coupon.id,
        customerId,
      },
    });

    if (customerUsageCount >= coupon.perCustomerLimit) {
      return {
        isValid: false,
        discountAmount: 0,
        freeShipping: false,
        message: "You have already used this coupon maximum allowed times",
      };
    }
  }

  let discountAmount = 0;
  if (coupon.type === "PERCENTAGE") {
    discountAmount = (subtotal * coupon.value) / 100;
    if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
      discountAmount = coupon.maxDiscount;
    }
  } else if (coupon.type === "FIXED_AMOUNT") {
    discountAmount = Math.min(subtotal, coupon.value);
  }

  return {
    isValid: true,
    discountAmount: Math.round(discountAmount),
    freeShipping: coupon.freeShipping || coupon.type === "FREE_SHIPPING",
    coupon: {
      id: coupon.id,
      code: coupon.code,
      type: coupon.type,
      value: coupon.value,
    },
  };
}
