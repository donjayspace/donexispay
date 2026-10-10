export type ProviderPaymentStatus =
  | "PENDING"
  | "REQUIRES_ACTION"
  | "SUCCEEDED"
  | "FAILED"
  | "CANCELED"
  | "UNKNOWN";

export interface CreateProviderPaymentInput {
  internalPaymentId: string;
  merchantReference: string;
  amountMinor: bigint;
  currency: string;
  returnUrl: string;
  cancelUrl?: string;
  idempotencyKey: string;
}

export interface ProviderPaymentResult {
  providerPaymentId: string;
  status: ProviderPaymentStatus;
  checkoutUrl?: string;
  rawStatus?: string;
  requestReference?: string;
}

export interface PaymentProvider {
  readonly providerId: string;
  createPayment(input: CreateProviderPaymentInput): Promise<ProviderPaymentResult>;
  getPayment(providerPaymentId: string): Promise<ProviderPaymentResult>;
}
