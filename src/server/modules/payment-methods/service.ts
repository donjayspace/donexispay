import "server-only";
import { ApiKeyEnvironment } from "@prisma/client";
import { prisma } from "@/server/infrastructure/database/prisma";

/**
 * Capabilities are descriptive metadata supplied by reviewed provider configuration.
 * This service never infers that a payment method is enabled merely because it exists.
 */
export async function listConfiguredPaymentMethods(environment: ApiKeyEnvironment) {
  const providers = await prisma.providerConfiguration.findMany({
    where: { environment, enabled: true },
    select: { providerId: true, displayName: true, capabilities: true },
    orderBy: { displayName: "asc" },
  });
  return providers.map((provider) => ({ providerId: provider.providerId, displayName: provider.displayName, capabilities: provider.capabilities }));
}
