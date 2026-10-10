import "server-only";
import { prisma } from "@/server/infrastructure/database/prisma";

/** A lightweight platform summary; deeper analytics should use pre-aggregated reporting tables. */
export async function getPlatformOverview() {
  const [merchants, users, payments, failedEvents, latestAudit] = await Promise.all([
    prisma.merchant.count(),
    prisma.user.count(),
    prisma.payment.count(),
    prisma.providerEvent.count({ where: { status: "FAILED" } }),
    prisma.auditLog.findMany({ orderBy: { createdAt: "desc" }, take: 8, select: { id: true, actorType: true, action: true, outcome: true, createdAt: true } }),
  ]);
  return { merchants, users, payments, failedEvents, latestAudit };
}
