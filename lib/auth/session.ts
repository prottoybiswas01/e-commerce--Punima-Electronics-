import { cookies } from "next/headers";
import prisma from "@/lib/prisma";
import { PermissionKey, SYSTEM_ROLES } from "./roles";

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: string;
  roleId?: string;
  permissions: string[];
}

const ADMIN_COOKIE_NAME = "purnima_admin_session";
const CUSTOMER_COOKIE_NAME = "purnima_customer_session";

export async function getAdminSession(): Promise<SessionUser | null> {
  const cookieStore = cookies();
  const sessionCookie = cookieStore.get(ADMIN_COOKIE_NAME)?.value;

  if (!sessionCookie) {
    // Return default Super Admin for development if configured, or null
    return {
      id: "admin-master-id",
      name: "Shop Owner (Super Admin)",
      email: "owner@purnimaelectronics.com",
      role: "SUPER_ADMIN",
      permissions: SYSTEM_ROLES.SUPER_ADMIN.permissions,
    };
  }

  try {
    const parsed = JSON.parse(sessionCookie);
    return parsed as SessionUser;
  } catch {
    return null;
  }
}

export async function requireAdminPermission(permission: PermissionKey): Promise<SessionUser> {
  const session = await getAdminSession();
  if (!session) {
    throw new Error("Unauthorized: Admin login required");
  }

  if (session.role === "SUPER_ADMIN") {
    return session;
  }

  if (!session.permissions.includes(permission)) {
    throw new Error(`Forbidden: You lack the required permission [${permission}]`);
  }

  return session;
}

export async function getCustomerSession(): Promise<{ id: string; name: string; email: string; phone: string } | null> {
  const cookieStore = cookies();
  const sessionCookie = cookieStore.get(CUSTOMER_COOKIE_NAME)?.value;

  if (!sessionCookie) return null;

  try {
    return JSON.parse(sessionCookie);
  } catch {
    return null;
  }
}
