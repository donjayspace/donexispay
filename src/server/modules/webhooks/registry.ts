import "server-only";
import type { ProviderWebhookAdapter } from "./types/provider-webhook";

/** Only explicitly registered, reviewed adapters may accept provider webhooks. */
class ProviderWebhookRegistry {
  private readonly adapters = new Map<string, ProviderWebhookAdapter>();

  register(adapter: ProviderWebhookAdapter) {
    if (!/^[a-z0-9][a-z0-9_-]{1,63}$/.test(adapter.providerId)) throw new Error("Invalid provider ID.");
    if (this.adapters.has(adapter.providerId)) throw new Error("Webhook adapter is already registered.");
    this.adapters.set(adapter.providerId, adapter);
  }

  get(providerId: string) {
    return this.adapters.get(providerId) ?? null;
  }
}

export const providerWebhookRegistry = new ProviderWebhookRegistry();
