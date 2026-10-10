import "server-only";
import { prisma } from "@/server/infrastructure/database/prisma";
import { AppError } from "@/server/shared/errors/app-error";

/** Calculate platform fees in integer minor units using basis points, never floating point. */
export function calculateFeeMinor(amountMinor: bigint, fixedFeeMinor: bigint, percentageBps: number): bigint {
  if (amountMinor < 0n || fixedFeeMinor < 0n || !Number.isInteger(percentageBps) || percentageBps < 0 || percentageBps > 100_000) {
    throw new AppError("VALIDATION_ERROR", "Pricing values are outside allowed bounds.", 400);
  }
  return fixedFeeMinor + (amountMinor * BigInt(percentageBps)) / 10_000n;
}

export async function listPricingRules(merchantId?: string) {
  return prisma.pricingRule.findMany({
    where: merchantId ? { OR: [{ merchantId }, { merchantId: null }] } : {},
    orderBy: [{ active: "desc" }, { effectiveFrom: "desc" }],
    take: 200,
    select: { id: true, merchantId: true, name: true, countryCode: true, currency: true, paymentMethod: true, fixedFeeMinor: true, percentageBps: true, active: true, effectiveFrom: true, effectiveUntil: true },
  });
}
