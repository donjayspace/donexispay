import { NextRequest, NextResponse } from "next/server";
import { authenticateMerchantApiKey } from "@/server/modules/auth/api-key";
import { getMerchantPayment } from "@/server/modules/payments/services/create-payment";
import { errorResponse } from "@/server/infrastructure/security/api-response";
import { AppError } from "@/server/shared/errors/app-error";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest, context: { params: Promise<{ paymentId: string }> }) {
  try {
    const principal = await authenticateMerchantApiKey(request.headers.get("authorization"));
    if (!principal.scopes.includes("*") && !principal.scopes.includes("payments:read")) {
      throw new AppError("FORBIDDEN", "API key does not have payment read permission.", 403);
    }
    const { paymentId } = await context.params;
    const payment = await getMerchantPayment(principal.merchantId, paymentId);
    if (!payment) throw new AppError("NOT_FOUND", "Payment not found.", 404);
    return NextResponse.json({
      data: { ...payment, amountMinor: payment.amountMinor.toString(), createdAt: payment.createdAt.toISOString(), completedAt: payment.completedAt?.toISOString() ?? null },
    }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return errorResponse(error);
  }
}
