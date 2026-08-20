export const PERMISSIONS = {
  // Orders
  VIEW_ORDERS: "view_orders",
  UPDATE_ORDERS: "update_orders",
  CANCEL_ORDERS: "cancel_orders",
  CREATE_SHIPMENT: "create_shipment",
  PROCESS_REFUNDS: "process_refunds",

  // Products & Categories
  VIEW_PRODUCTS: "view_products",
  CREATE_PRODUCTS: "create_products",
  EDIT_PRODUCTS: "edit_products",
  DELETE_PRODUCTS: "delete_products",
  MANAGE_CATEGORIES: "manage_categories",

  // Inventory
  VIEW_INVENTORY: "view_inventory",
  MANAGE_INVENTORY: "manage_inventory",

  // Marketing
  MANAGE_COUPONS: "manage_coupons",
  MANAGE_BANNERS: "manage_banners",
  MANAGE_PROMOTIONS: "manage_promotions",

  // Customers & Reviews
  VIEW_CUSTOMERS: "view_customers",
  MANAGE_CUSTOMERS: "manage_customers",
  MANAGE_REVIEWS: "manage_reviews",
  MANAGE_RETURNS: "manage_returns",

  // Analytics & Settings & Admins
  VIEW_REPORTS: "view_reports",
  VIEW_AUDIT_LOGS: "view_audit_logs",
  MANAGE_SETTINGS: "manage_settings",
  MANAGE_ADMINS: "manage_admins",
} as const;

export type PermissionKey = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

export interface RoleDefinition {
  name: string;
  description: string;
  permissions: PermissionKey[];
}

export const SYSTEM_ROLES: Record<string, RoleDefinition> = {
  SUPER_ADMIN: {
    name: "Super Admin",
    description: "Complete unrestricted access to all business modules and settings",
    permissions: Object.values(PERMISSIONS),
  },
  ADMIN: {
    name: "Admin",
    description: "Full management access excluding critical system deletions",
    permissions: Object.values(PERMISSIONS).filter(
      (p) => p !== PERMISSIONS.MANAGE_ADMINS
    ),
  },
  MANAGER: {
    name: "Manager",
    description: "Operational management for products, orders, inventory, and promotions",
    permissions: [
      PERMISSIONS.VIEW_ORDERS,
      PERMISSIONS.UPDATE_ORDERS,
      PERMISSIONS.CANCEL_ORDERS,
      PERMISSIONS.CREATE_SHIPMENT,
      PERMISSIONS.VIEW_PRODUCTS,
      PERMISSIONS.CREATE_PRODUCTS,
      PERMISSIONS.EDIT_PRODUCTS,
      PERMISSIONS.MANAGE_CATEGORIES,
      PERMISSIONS.VIEW_INVENTORY,
      PERMISSIONS.MANAGE_INVENTORY,
      PERMISSIONS.MANAGE_COUPONS,
      PERMISSIONS.MANAGE_BANNERS,
      PERMISSIONS.MANAGE_PROMOTIONS,
      PERMISSIONS.VIEW_CUSTOMERS,
      PERMISSIONS.MANAGE_REVIEWS,
      PERMISSIONS.MANAGE_RETURNS,
      PERMISSIONS.VIEW_REPORTS,
    ],
  },
  ORDER_MANAGER: {
    name: "Order Manager",
    description: "Dedicated to order fulfillment, status tracking, courier booking, and returns",
    permissions: [
      PERMISSIONS.VIEW_ORDERS,
      PERMISSIONS.UPDATE_ORDERS,
      PERMISSIONS.CANCEL_ORDERS,
      PERMISSIONS.CREATE_SHIPMENT,
      PERMISSIONS.MANAGE_RETURNS,
      PERMISSIONS.VIEW_CUSTOMERS,
    ],
  },
  INVENTORY_MANAGER: {
    name: "Inventory Manager",
    description: "Dedicated to stock adjustments, purchase logs, restocks, and product stock monitoring",
    permissions: [
      PERMISSIONS.VIEW_PRODUCTS,
      PERMISSIONS.EDIT_PRODUCTS,
      PERMISSIONS.VIEW_INVENTORY,
      PERMISSIONS.MANAGE_INVENTORY,
    ],
  },
  STAFF: {
    name: "Staff",
    description: "Read-only and basic status updater for general staff",
    permissions: [
      PERMISSIONS.VIEW_ORDERS,
      PERMISSIONS.VIEW_PRODUCTS,
      PERMISSIONS.VIEW_INVENTORY,
      PERMISSIONS.VIEW_CUSTOMERS,
    ],
  },
};
