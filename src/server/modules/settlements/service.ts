import "server-only";
import { prisma } from "@/server/infrastructure/database/prisma";

/** Settlement rows are imported from provider statements; they are not proof of bank payout. */
export async function listSettlements(input: { merchantId?: string; providerId?: string; take?: number } = {}) {
  return prisma.settlement.findMany({
    where: { ...(input.merchantId ? { merchantId: input.merchantId } : {}), ...(input.providerId ? { providerId: input.providerId } : {}) },
    orderBy: { createdAt: "desc" },
    take: Math.min(Math.max(input.take ?? 50, 1), 200),
    select: { id: true, merchantId: true, providerId: true, providerReference: true, currency: true, grossMinor: true, feeMinor: true, netMinor: true, status: true, settlementDate: true, createdAt: true },
  });
}
