import prisma from "@/lib/prisma";

export async function getRecentNotifications(limit = 10) {
  return await prisma.notification.findMany({
    take: limit,
    orderBy: { createdAt: "desc" },
  });
}

export async function markNotificationAsRead(id: string) {
  return await prisma.notification.update({
    where: { id },
    data: { isRead: true },
  });
}
