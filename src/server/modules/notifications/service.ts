import "server-only";
import { prisma } from "@/server/infrastructure/database/prisma";
import { AppError } from "@/server/shared/errors/app-error";

/** Store a notification first; delivery is a separate retryable operation. */
export async function createNotification(input: { userId?: string; merchantId?: string; type: string; title: string; message: string }) {
  if (!input.userId && !input.merchantId) throw new AppError("VALIDATION_ERROR", "A notification recipient is required.", 400);
  return prisma.notification.create({
    data: {
      userId: input.userId,
      merchantId: input.merchantId,
      type: input.type.trim().slice(0, 64),
      title: input.title.trim().slice(0, 160),
      message: input.message.trim().slice(0, 2000),
    },
  });
}

/** Always scope the query to the authenticated recipient; never accept recipient ID from the browser alone. */
export async function listUserNotifications(userId: string, take = 30) {
  return prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: Math.min(Math.max(take, 1), 100),
    select: { id: true, type: true, title: true, message: true, readAt: true, createdAt: true },
  });
}

export async function markUserNotificationRead(userId: string, notificationId: string) {
  const result = await prisma.notification.updateMany({
    where: { id: notificationId, userId, readAt: null },
    data: { readAt: new Date() },
  });
  if (!result.count) throw new AppError("NOT_FOUND", "Notification not found.", 404);
}
