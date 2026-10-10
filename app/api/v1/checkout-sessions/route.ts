import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { authenticateMerchantApiKey } from "@/server/modules/auth/api-key";
import { createCheckoutSessionSchema } from "@/server/modules/checkout/schemas/create-checkout-session";
import { createCheckoutSession } from "@/server/modules/checkout/services/create-checkout-session";
import { errorResponse } from "@/server/infrastructure/http/api-response";
import { AppError } from "@/server/shared/errors/app-error";

export const dynamic = "force-dynamic";

const idempotencyKeySchema = z.string().trim().min(8).max(200);

export async function POST(request: NextRequest) {
  const suppliedRequestId = request.headers.get("x-request-id") ?? "";
  const requestId = /^[a-zA-Z0-9._-]{1,100}$/.test(suppliedRequestId)
    ? suppliedRequestId
    : randomUUID();

  try {
    const principal = await authenticateMerchantApiKey(request.headers.get("authorization"));

    if (!principal.scopes.includes("*") && !principal.scopes.includes("checkout:sessions:create")) {
      throw new AppError("FORBIDDEN", "API key does not have permission to create checkout sessions.", 403);
    }

    const rawIdempotencyKey = request.headers.get("idempotency-key");
    const idempotencyKey = idempotencyKeySchema.parse(rawIdempotencyKey);

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      throw new AppError("VALIDATION_ERROR", "Request body must be valid JSON.", 400);
    }

    const data = createCheckoutSessionSchema.parse(body);
    const result = await createCheckoutSession({
      merchantId: principal.merchantId,
      idempotencyKey,
      data,
    });

    return NextResponse.json(
      { data: result.result, requestId },
      {
        status: result.replayed ? 200 : 201,
        headers: {
          "Cache-Control": "no-store",
          "X-Request-Id": requestId,
          ...(result.replayed ? { "Idempotency-Replayed": "true" } : {}),
        },
      },
    );
  } catch (error) {
    const response = errorResponse(error, requestId);
    response.headers.set("Cache-Control", "no-store");
    response.headers.set("X-Request-Id", requestId);
    return response;
  }
}
