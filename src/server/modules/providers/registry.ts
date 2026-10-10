import "server-only";
import type { PaymentProvider } from "./types/payment-provider";

/**
 * Explicit registry avoids guessing a provider from arbitrary request input.
 * Register a reviewed adapter at application startup when provider approval is complete.
 */
export class PaymentProviderRegistry {
  private readonly adapters = new Map<string, PaymentProvider>();

  register(adapter: PaymentProvider) {
    if (!/^[a-z0-9][a-z0-9_-]{1,63}$/.test(adapter.providerId)) throw new Error("Provider ID must be a normalized identifier.");
    if (this.adapters.has(adapter.providerId)) throw new Error(`Provider adapter already registered: ${adapter.providerId}`);
    this.adapters.set(adapter.providerId, adapter);
  }

  get(providerId: string): PaymentProvider | null {
    return this.adapters.get(providerId) ?? null;
  }

  list(): string[] {
    return [...this.adapters.keys()].sort();
  }
}

export const paymentProviderRegistry = new PaymentProviderRegistry();
