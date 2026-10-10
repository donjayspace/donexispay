import type { Prisma } from "@prisma/client";

/** Contract returned by a provider-specific signature verifier. */
export interface VerifiedProviderWebhook {
  eventId: string;
  eventType: string;
  safePayload: Prisma.InputJsonValue;
}

/** Adapters own signature verification and provider-specific event normalization. */
export interface ProviderWebhookAdapter {
  readonly providerId: string;
  verifyAndNormalize(request: Request, rawBody: string): Promise<VerifiedProviderWebhook>;
}
