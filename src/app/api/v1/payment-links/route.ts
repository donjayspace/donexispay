import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { authenticateMerchantApiKey } from "@/server/modules/auth/api-key";
import { createPaymentLink, listMerchantPaymentLinks } from "@/server/modules/payment-links/service";
import { errorResponse } from "@/server/infrastructure/security/api-response";
import { AppError } from "@/server/shared/errors/app-error";

export const dynamic = "force-dynamic";
const schema = z.object({
  name: z.string().trim().min(2).max(120),
  amountMinor: z.string().regex(/^[1-9]\d{0,17}$/),
  currency: z.string().regex(/^[A-Za-z]{3}$/),
  description: z.string().trim().max(500).optional(),
  expiresAt: z.string().datetime().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const principal = await authenticateMerchantApiKey(request.headers.get("authorization"));
    if (!principal.scopes.includes("*") && !principal.scopes.includes("payment-links:read")) throw new AppError("FORBIDDEN", "API key does not have payment-link read permission.", 403);
    const rows = await listMerchantPaymentLinks(principal.merchantId);
    return NextResponse.json({ data: rows.map((row) => ({ ...row, amountMinor: row.amountMinor.toString() })) }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) { return errorResponse(error); }
}

export async function POST(request: NextRequest) {
  try {
    const principal = await authenticateMerchantApiKey(request.headers.get("authorization"));
    if (!principal.scopes.includes("*") && !principal.scopes.includes("payment-links:create")) throw new AppError("FORBIDDEN", "API key does not have payment-link creation permission.", 403);
    const body = schema.parse(await request.json());
    const result = await createPaymentLink({ merchantId: principal.merchantId, ...body, expiresAt: body.expiresAt ? new Date(body.expiresAt) : undefined });
    return NextResponse.json({ data: result }, { status: 201, headers: { "Cache-Control": "no-store" } });
  } catch (error) { return errorResponse(error); }
}
