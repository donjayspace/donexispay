export const APP_NAME = "DonexisPay" as const;

export const API_VERSION = "v1" as const;

export const PAYMENT_DEFAULTS = {
  checkoutSessionTtlMinutes: 30,
  idempotencyRetentionHours: 24,
  livePaymentsEnabledByDefault: false,
} as const;
