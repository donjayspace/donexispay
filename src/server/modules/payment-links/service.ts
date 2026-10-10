import "server-only";
import { createHash, randomBytes, randomUUID } from "node:crypto";
import { prisma } from "@/server/infrastructure/database/prisma";
import { env } from "@/lib/env";
import { AppError } from "@/server/shared/errors/app-error";
import { createCheckoutSession } from "@/server/modules/checkout/services/create-checkout-session";

const hashToken = (token: string) => createHash("sha256").update(token, "utf8").digest("hex");

/** The raw link token is returned once; the database stores only its hash. */
export async function createPaymentLink(input: { merchantId: string; name: string; amountMinor: string; currency: string; description?: string; expiresAt?: Date }) {
  if (!/^[1-9]\d{0,17}$/.test(input.amountMinor)) throw new AppError("VALIDATION_ERROR", "Amount must be a positive integer in minor units.", 400);
  if (!/^[A-Za-z]{3}$/.test(input.currency)) throw new AppError("VALIDATION_ERROR", "Currency must be a three-letter code.", 400);
  const merchant = await prisma.merchant.findUnique({ where: { id: input.merchantId }, select: { id: true, status: true } });
  if (!merchant || merchant.status !== "ACTIVE") throw new AppError("FORBIDDEN", "Only active merchants can create payment links.", 403);

  const token = randomBytes(32).toString("base64url");
  const link = await prisma.paymentLink.create({
    data: { merchantId: input.merchantId, name: input.name.trim().slice(0, 120), tokenHash: hashToken(token), amountMinor: BigInt(input.amountMinor), currency: input.currency.toUpperCase(), description: input.description?.trim().slice(0, 500), expiresAt: input.expiresAt },
    select: { id: true, name: true, amountMinor: true, currency: true, status: true, expiresAt: true, createdAt: true },
  });
  // The public URL resolver is intentionally separate from provider execution.
  return { ...link, amountMinor: link.amountMinor.toString(), url: new URL(`/checkout-link/${token}`, env.APP_URL).toString() };
}

/**
 * Resolve a public link into a short-lived checkout session. This only prepares the
 * checkout experience; a provider adapter must still confirm any resulting payment.
 */
export async function createCheckoutSessionFromPaymentLink(token: string) {
  if (!/^[A-Za-z0-9_-]{40,}$/.test(token)) throw new AppError("NOT_FOUND", "Payment link was not found.", 404);
  const link = await prisma.paymentLink.findUnique({
    where: { tokenHash: hashToken(token) },
    select: { id: true, merchantId: true, name: true, amountMinor: true, currency: true, description: true, status: true, expiresAt: true, successUrl: true, cancelUrl: true },
  });
  if (!link || link.status !== "ACTIVE" || (link.expiresAt && link.expiresAt <= new Date())) {
    throw new AppError("NOT_FOUND", "Payment link is inactive or expired.", 404);
  }

  const created = await createCheckoutSession({
    merchantId: link.merchantId,
    idempotencyKey: `payment-link:${link.id}:${randomUUID()}`,
    paymentLinkId: link.id,
    data: {
      orderReference: `pl_${link.id}_${randomUUID()}`.slice(0, 120),
      amountMinor: link.amountMinor.toString(),
      currency: link.currency,
      description: link.description || link.name,
      successUrl: link.successUrl ?? undefined,
      cancelUrl: link.cancelUrl ?? undefined,
    },
  });
  return created.result;
}

export async function listMerchantPaymentLinks(merchantId: string) {
  return prisma.paymentLink.findMany({
    where: { merchantId },
    orderBy: { createdAt: "desc" },
    take: 100,
    select: { id: true, name: true, amountMinor: true, currency: true, status: true, expiresAt: true, createdAt: true },
  });
}
