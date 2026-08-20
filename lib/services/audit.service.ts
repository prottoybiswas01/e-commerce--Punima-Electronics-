import prisma from "@/lib/prisma";

export async function logAdminActivity(params: {
  userId?: string;
  userName: string;
  action: string;
  entity: string;
  entityId?: string;
  previousState?: any;
  newState?: any;
  ipAddress?: string;
  userAgent?: string;
}) {
  try {
    return await prisma.auditLog.create({
      data: {
        userId: params.userId,
        userName: params.userName,
        action: params.action,
        entity: params.entity,
        entityId: params.entityId,
        previousState: params.previousState ? JSON.stringify(params.previousState) : null,
        newState: params.newState ? JSON.stringify(params.newState) : null,
        ipAddress: params.ipAddress,
        userAgent: params.userAgent,
      },
    });
  } catch (error) {
    console.error("[Audit Log Error]", error);
  }
}
