import "server-only";
import { prisma } from "@/server/infrastructure/database/prisma";

/** Platform operations can inspect refund state, but execution remains provider-adapter owned. */
export async function listAdminRefunds(take = 100) {
  return prisma.refund.findMany({
    orderBy: { createdAt: "desc" },
    take: Math.min(Math.max(take, 1), 200),
    select: { id: true, merchantId: true, paymentId: true, amountMinor: true, currency: true, status: true, reason: true, providerRefundId: true, createdAt: true, completedAt: true },
  });
}
