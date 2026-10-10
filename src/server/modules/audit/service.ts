import "server-only";
import { prisma } from "@/server/infrastructure/database/prisma";

/** Audit records are append-only from application workflows; this module exposes read access only. */
export async function listAuditEvents(take = 100) {
  return prisma.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: Math.min(Math.max(take, 1), 200),
    select: { id: true, actorType: true, actorId: true, action: true, targetType: true, targetId: true, outcome: true, requestId: true, createdAt: true },
  });
}
