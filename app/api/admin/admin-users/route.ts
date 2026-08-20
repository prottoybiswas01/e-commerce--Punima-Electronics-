import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth/session";

export async function GET() {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const [adminUsers, roles] = await Promise.all([
      prisma.adminUser.findMany({
        include: { role: true },
        orderBy: { createdAt: "desc" },
      }),
      prisma.role.findMany({
        orderBy: { name: "asc" },
      }),
    ]);

    return NextResponse.json({ success: true, adminUsers, roles });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { name, email, roleId } = await req.json();

    if (!name || !email || !roleId) {
      return NextResponse.json(
        { success: false, message: "Name, email, and role are required" },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();

    // Check if User already exists or create new User record
    let user = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          name,
          email: cleanEmail,
          role: "ADMIN",
        },
      });
    } else {
      await prisma.user.update({
        where: { id: user.id },
        data: { role: "ADMIN" },
      });
    }

    // Check if already an adminUser
    const existingAdmin = await prisma.adminUser.findUnique({
      where: { email: cleanEmail },
    });

    if (existingAdmin) {
      return NextResponse.json(
        { success: false, message: "This email is already assigned an admin role" },
        { status: 400 }
      );
    }

    const adminUser = await prisma.adminUser.create({
      data: {
        userId: user.id,
        name,
        email: cleanEmail,
        roleId,
        isActive: true,
      },
      include: { role: true },
    });

    await prisma.auditLog.create({
      data: {
        userName: session.name,
        action: "CREATE_ADMIN_USER",
        entity: "AdminUser",
        entityId: adminUser.id,
        newState: JSON.stringify(adminUser),
      },
    });

    return NextResponse.json({ success: true, adminUser });
  } catch (error: any) {
    console.error("[Admin User Create Error]", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to create admin user" },
      { status: 500 }
    );
  }
}
