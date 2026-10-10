import "server-only";
import { prisma } from "@/server/infrastructure/database/prisma";

/** Merchant transaction queries must receive a merchant ID from an authenticated principal. */
export async function listMerchantTransactions(merchantId: string, take = 50) {
  return prisma.payment.findMany({
    where: { merchantId },
    orderBy: { createdAt: "desc" },
    take: Math.min(Math.max(take, 1), 100),
    select: { id: true, checkoutSessionId: true, amountMinor: true, currency: true, status: true, providerId: true, createdAt: true, completedAt: true },
  });
}
