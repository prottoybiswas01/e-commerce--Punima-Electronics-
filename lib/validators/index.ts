import { z } from "zod";

// Checkout & Order Form
export const checkoutSchema = z.object({
  customerName: z.string().min(2, "Full name must be at least 2 characters"),
  customerPhone: z
    .string()
    .min(11, "Phone number must be at least 11 digits (e.g. 01712345678)")
    .regex(/^(?:\+88|88)?(01[3-9]\d{8})$/, "Please enter a valid Bangladeshi mobile number"),
  customerEmail: z.string().email("Invalid email address").optional().or(z.literal("")),
  division: z.string().min(1, "Please select division"),
  district: z.string().min(1, "Please select district"),
  upazila: z.string().min(1, "Please select upazila / thana"),
  area: z.string().optional(),
  addressLine: z.string().min(5, "Please enter detailed street address"),
  deliveryInstructions: z.string().optional(),
  orderNotes: z.string().optional(),
  paymentMethod: z.enum(["COD", "BKASH", "NAGAD", "CARD"]).default("COD"),
  couponCode: z.string().optional(),
  items: z.array(
    z.object({
      productId: z.string(),
      variantId: z.string().optional(),
      quantity: z.number().int().positive(),
    })
  ).min(1, "Your cart is empty"),
});

export type CheckoutFormValues = z.infer<typeof checkoutSchema>;

// Product Schema
export const productSchema = z.object({
  name: z.string().min(2, "Product name is required"),
  slug: z.string().min(2, "Slug is required"),
  sku: z.string().min(2, "SKU is required"),
  categoryId: z.string().min(1, "Category is required"),
  brandId: z.string().optional().nullable(),
  description: z.string().min(10, "Description is required"),
  shortDescription: z.string().optional().nullable(),
  price: z.coerce.number().positive("Price must be positive"),
  originalPrice: z.coerce.number().optional().nullable(),
  discount: z.coerce.number().min(0).max(100).optional().nullable(),
  costPrice: z.coerce.number().min(0).default(0),
  stock: z.coerce.number().int().min(0, "Stock cannot be negative"),
  lowStockThreshold: z.coerce.number().int().min(0).default(5),
  weight: z.coerce.number().min(0.1).default(0.5),
  dimensions: z.string().optional().nullable(),
  tags: z.string().optional().nullable(),
  isFeatured: z.boolean().default(false),
  isBestSeller: z.boolean().default(false),
  isNewArrival: z.boolean().default(false),
  isActive: z.boolean().default(true),
  seoTitle: z.string().optional().nullable(),
  seoDescription: z.string().optional().nullable(),
  images: z.array(
    z.object({
      url: z.string().url("Invalid image URL"),
      altText: z.string().optional(),
      isPrimary: z.boolean().default(false),
    })
  ).min(1, "At least one product image is required"),
  variants: z
    .array(
      z.object({
        name: z.string().min(1, "Variant name required"),
        sku: z.string().min(1, "Variant SKU required"),
        price: z.coerce.number().positive(),
        originalPrice: z.coerce.number().optional().nullable(),
        costPrice: z.coerce.number().default(0),
        stock: z.coerce.number().int().min(0),
        attributesJson: z.string().optional(),
      })
    )
    .optional(),
});

export type ProductFormValues = z.infer<typeof productSchema>;

// Coupon Schema
export const couponSchema = z.object({
  code: z.string().min(3, "Coupon code must be at least 3 characters").toUpperCase(),
  type: z.enum(["PERCENTAGE", "FIXED_AMOUNT", "FREE_SHIPPING"]),
  value: z.coerce.number().min(0, "Value must be positive"),
  minOrderAmount: z.coerce.number().min(0).default(0),
  maxDiscount: z.coerce.number().optional().nullable(),
  usageLimit: z.coerce.number().int().optional().nullable(),
  perCustomerLimit: z.coerce.number().int().default(1),
  startDate: z.string().or(z.date()),
  endDate: z.string().or(z.date()).optional().nullable(),
  isActive: z.boolean().default(true),
});

export type CouponFormValues = z.infer<typeof couponSchema>;

// Banner Schema
export const bannerSchema = z.object({
  title: z.string().min(2, "Title is required"),
  subtitle: z.string().optional().nullable(),
  ctaText: z.string().default("Shop Now"),
  ctaLink: z.string().default("/shop"),
  imageUrl: z.string().url("Image URL is required"),
  mobileImageUrl: z.string().url().optional().nullable().or(z.literal("")),
  targetType: z.enum(["PRODUCT", "CATEGORY", "PROMOTION", "EXTERNAL"]).default("PRODUCT"),
  targetId: z.string().optional().nullable(),
  displayOrder: z.coerce.number().int().default(0),
  isActive: z.boolean().default(true),
});

export type BannerFormValues = z.infer<typeof bannerSchema>;

// Inventory Adjustment Schema
export const inventoryAdjustmentSchema = z.object({
  productId: z.string(),
  variantId: z.string().optional().nullable(),
  changeQuantity: z.coerce.number().int(),
  reason: z.enum([
    "PURCHASE",
    "SALE",
    "RETURN",
    "DAMAGE",
    "MANUAL_ADJUSTMENT",
    "CORRECTION",
    "RESTOCK",
  ]),
  notes: z.string().optional(),
});

export type InventoryAdjustmentValues = z.infer<typeof inventoryAdjustmentSchema>;

// Review Schema
export const reviewSchema = z.object({
  productId: z.string(),
  rating: z.number().int().min(1).max(5),
  customerName: z.string().min(2, "Name is required"),
  title: z.string().optional(),
  comment: z.string().min(5, "Review comment must be at least 5 characters"),
  imageUrl: z.string().optional(),
});

export type ReviewFormValues = z.infer<typeof reviewSchema>;

// Store Settings Schema
export const settingsSchema = z.object({
  shopName: z.string().min(2),
  logoUrl: z.string().optional().nullable(),
  phone: z.string().min(5),
  email: z.string().email(),
  address: z.string().min(5),
  businessHours: z.string().optional(),
  currency: z.string().default("BDT"),
  currencySymbol: z.string().default("৳"),
  defaultDeliveryInsideDhaka: z.coerce.number().min(0),
  defaultDeliveryOutsideDhaka: z.coerce.number().min(0),
  freeShippingThreshold: z.coerce.number().min(0),
  returnPolicy: z.string().optional().nullable(),
  shippingPolicy: z.string().optional().nullable(),
  privacyPolicy: z.string().optional().nullable(),
  termsConditions: z.string().optional().nullable(),
  socialFacebook: z.string().optional().nullable(),
  socialInstagram: z.string().optional().nullable(),
  socialYoutube: z.string().optional().nullable(),
  metaTitle: z.string().optional().nullable(),
  metaDescription: z.string().optional().nullable(),
});

export type SettingsFormValues = z.infer<typeof settingsSchema>;
