import React from "react";
import prisma from "@/lib/prisma";
import { AdminUserManager } from "@/components/admin/admin-user-manager";

export const revalidate = 0;

export default async function AdminUsersPage() {
  const [roles, adminUsers] = await Promise.all([
    prisma.role.findMany({
      include: {
        permissions: {
          include: { permission: true },
        },
      },
      orderBy: { createdAt: "asc" },
    }),
    prisma.adminUser.findMany({
      include: {
        role: {
          include: {
            permissions: {
              include: { permission: true },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return <AdminUserManager initialAdminUsers={adminUsers as any} roles={roles as any} />;
}
