import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { authenticateMerchantApiKey } from "@/server/modules/auth/api-key";
import { createPayment } from "@/server/modules/payments/services/create-payment";
import { errorResponse } from "@/server/infrastructure/security/api-response";
import { AppError } from "@/server/shared/errors/app-error";

export const dynamic = "force-dynamic";
const bodySchema = z.object({
  checkoutSessionId: z.string().min(1).max(128),
  providerId: z.string().regex(/^[a-z0-9][a-z0-9_-]{1,63}$/),
});
const idempotencySchema = z.string().trim().min(8).max(200);

export async function POST(request: NextRequest) {
  try {
    const principal = await authenticateMerchantApiKey(request.headers.get("authorization"));
    if (!principal.scopes.includes("*") && !principal.scopes.includes("payments:create")) {
      throw new AppError("FORBIDDEN", "API key does not have payment creation permission.", 403);
    }
    const idempotencyKey = idempotencySchema.parse(request.headers.get("idempotency-key"));
    const body = bodySchema.parse(await request.json());
    const result = await createPayment({
      merchantId: principal.merchantId,
      environment: principal.environment,
      checkoutSessionId: body.checkoutSessionId,
      providerId: body.providerId,
      idempotencyKey,
    });

    const payment = result.payment;
    return NextResponse.json({
      data: {
        id: payment.id,
        status: payment.status,
        amountMinor: payment.amountMinor.toString(),
        currency: payment.currency,
        providerId: payment.providerId,
        providerPaymentId: payment.providerPaymentId,
        providerRedirectUrl: result.providerRedirectUrl,
        createdAt: payment.createdAt.toISOString(),
      },
      replayed: result.replayed,
      uncertain: result.uncertain,
    }, { status: result.replayed ? 200 : 202, headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return errorResponse(error);
  }
}
