import "server-only";
import { Prisma } from "@prisma/client";
import { prisma } from "@/server/infrastructure/database/prisma";
import type { VerifiedProviderWebhook } from "./types/provider-webhook";

/**
 * Store verified events durably and deduplicate by provider event ID.
 * Business state transitions are handled by an idempotent worker, not by the
 * HTTP request that receives the provider's webhook.
 */
export async function recordVerifiedProviderEvent(providerId: string, event: VerifiedProviderWebhook) {
  try {
    const record = await prisma.providerEvent.create({
      data: {
        providerId,
        providerEventId: event.eventId,
        eventType: event.eventType,
        payload: event.safePayload,
        status: "RECEIVED",
      },
      select: { id: true, status: true, receivedAt: true },
    });
    return { duplicate: false, record };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      const record = await prisma.providerEvent.findUnique({
        where: { providerId_providerEventId: { providerId, providerEventId: event.eventId } },
        select: { id: true, status: true, receivedAt: true },
      });
      if (record) return { duplicate: true, record };
    }
    throw error;
  }
}
