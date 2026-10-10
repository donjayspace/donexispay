import { z } from "zod";

// Amounts are integer minor units; currency-specific exponent checks belong in the currency policy.
export const createCheckoutSessionSchema = z.object({
  orderReference: z.string().trim().min(1).max(120),
  amountMinor: z.string().regex(/^[1-9]\d{0,17}$/, "Amount must be a positive integer in minor units."),
  currency: z.string().trim().length(3).transform((value) => value.toUpperCase()),
  description: z.string().trim().max(500).optional(),
  successUrl: z.string().url().optional(),
  cancelUrl: z.string().url().optional(),
});

export type CreateCheckoutSessionInput = z.infer<typeof createCheckoutSessionSchema>;
