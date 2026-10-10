import "server-only";
import { prisma } from "@/server/infrastructure/database/prisma";

/** Stored provider metadata contains no credentials. Secret material belongs in deployment secret storage. */
export async function listProviderConfigurations() {
  return prisma.providerConfiguration.findMany({
    orderBy: [{ providerId: "asc" }, { environment: "asc" }],
    select: { id: true, providerId: true, displayName: true, environment: true, enabled: true, capabilities: true, createdAt: true, updatedAt: true },
  });
}
