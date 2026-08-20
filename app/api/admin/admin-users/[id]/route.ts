import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth/session";

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { roleId, isActive } = await req.json();

    const adminUser = await prisma.adminUser.update({
      where: { id: params.id },
      data: {
        roleId: roleId || undefined,
        isActive: isActive !== undefined ? Boolean(isActive) : undefined,
      },
      include: { role: true },
    });

    await prisma.auditLog.create({
      data: {
        userName: session.name,
        action: "UPDATE_ADMIN_USER",
        entity: "AdminUser",
        entityId: adminUser.id,
        newState: JSON.stringify(adminUser),
      },
    });

    return NextResponse.json({ success: true, adminUser });
  } catch (error: any) {
    console.error("[Admin User Update Error]", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to update admin user" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const adminUser = await prisma.adminUser.findUnique({
      where: { id: params.id },
      include: { role: true },
    });

    if (!adminUser) {
      return NextResponse.json({ success: false, message: "Admin not found" }, { status: 404 });
    }

    if (adminUser.role.name === "Super Admin") {
      const superAdminCount = await prisma.adminUser.count({
        where: { role: { name: "Super Admin" } },
      });
      if (superAdminCount <= 1) {
        return NextResponse.json(
          { success: false, message: "Cannot delete the primary Super Admin account" },
          { status: 400 }
        );
      }
    }

    await prisma.adminUser.delete({
      where: { id: params.id },
    });

    await prisma.auditLog.create({
      data: {
        userName: session.name,
        action: "DELETE_ADMIN_USER",
        entity: "AdminUser",
        entityId: params.id,
      },
    });

    return NextResponse.json({ success: true, message: "Admin removed successfully" });
  } catch (error: any) {
    console.error("[Admin User Delete Error]", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to delete admin user" },
      { status: 500 }
    );
  }
}
