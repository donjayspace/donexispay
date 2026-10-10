import "server-only";
import { prisma } from "@/server/infrastructure/database/prisma";

/** Payloads are intentionally omitted from admin lists because provider payloads can contain PII. */
export async function getProviderEventAdminOverview() {
  const [total, received, processing, failed, processed, recent] = await Promise.all([
    prisma.providerEvent.count(),
    prisma.providerEvent.count({ where: { status: "RECEIVED" } }),
    prisma.providerEvent.count({ where: { status: "PROCESSING" } }),
    prisma.providerEvent.count({ where: { status: "FAILED" } }),
    prisma.providerEvent.count({ where: { status: "PROCESSED" } }),
    prisma.providerEvent.findMany({ orderBy: { receivedAt: "desc" }, take: 50, select: { id: true, providerId: true, providerEventId: true, eventType: true, status: true, receivedAt: true, processedAt: true, lastError: true } }),
  ]);
  return { counts: { total, received, processing, failed, processed }, recent };
}
