import "server-only";
import { prisma } from "@/server/infrastructure/database/prisma";

/**
 * Read-only operations query for the admin console.
 * Payment state transitions remain owned by the payment application service.
 */
export async function getPaymentAdminOverview() {
  const [total, successful, processing, failed, recent] = await Promise.all([
    prisma.payment.count(),
    prisma.payment.count({ where: { status: "SUCCEEDED" } }),
    prisma.payment.count({ where: { status: { in: ["CREATED", "REQUIRES_ACTION", "PROCESSING", "REQUIRES_REVIEW"] } } }),
    prisma.payment.count({ where: { status: { in: ["FAILED", "CANCELED", "EXPIRED"] } } }),
    prisma.payment.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
      select: { id: true, merchantId: true, amountMinor: true, currency: true, status: true, providerId: true, createdAt: true, completedAt: true },
    }),
  ]);
  return { counts: { total, successful, processing, failed }, recent };
}
