import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { authenticateMerchantApiKey } from "@/server/modules/auth/api-key";
import { requestRefund, listMerchantRefunds } from "@/server/modules/refunds/service";
import { errorResponse } from "@/server/infrastructure/security/api-response";
import { AppError } from "@/server/shared/errors/app-error";

export const dynamic = "force-dynamic";
const schema = z.object({ paymentId: z.string().min(1).max(128), amountMinor: z.string().regex(/^[1-9]\d{0,17}$/), currency: z.string().regex(/^[A-Za-z]{3}$/), reason: z.string().trim().max(500).optional() });
const idempotencySchema = z.string().trim().min(8).max(200);

export async function GET(request: NextRequest) {
  try {
    const principal = await authenticateMerchantApiKey(request.headers.get("authorization"));
    if (!principal.scopes.includes("*") && !principal.scopes.includes("refunds:read")) throw new AppError("FORBIDDEN", "API key does not have refund read permission.", 403);
    return NextResponse.json({ data: await listMerchantRefunds(principal.merchantId) }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) { return errorResponse(error); }
}

export async function POST(request: NextRequest) {
  try {
    const principal = await authenticateMerchantApiKey(request.headers.get("authorization"));
    if (!principal.scopes.includes("*") && !principal.scopes.includes("refunds:create")) throw new AppError("FORBIDDEN", "API key does not have refund creation permission.", 403);
    const idempotencyKey = idempotencySchema.parse(request.headers.get("idempotency-key"));
    const body = schema.parse(await request.json());
    const refund = await requestRefund({ merchantId: principal.merchantId, idempotencyKey, ...body });
    // 202 means accepted for processing; no provider refund is claimed to have completed.
    return NextResponse.json({ data: { ...refund, amountMinor: refund.amountMinor.toString() } }, { status: 202, headers: { "Cache-Control": "no-store" } });
  } catch (error) { return errorResponse(error); }
}
