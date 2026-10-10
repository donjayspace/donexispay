import "server-only";
import { prisma } from "@/server/infrastructure/database/prisma";

/** The listing intentionally excludes review notes; notes may contain sensitive investigation details. */
export async function listAdminRiskReviews(take = 100) {
  return prisma.riskReview.findMany({
    orderBy: { createdAt: "desc" },
    take: Math.min(Math.max(take, 1), 200),
    select: { id: true, paymentId: true, status: true, score: true, reasonCode: true, reviewedByAdminId: true, reviewedAt: true, createdAt: true },
  });
}
