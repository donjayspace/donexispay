import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { authenticateMerchantApiKey } from "@/server/modules/auth/api-key";
import { listMerchantCustomers, upsertMerchantCustomer } from "@/server/modules/customers/service";
import { errorResponse } from "@/server/infrastructure/security/api-response";
import { AppError } from "@/server/shared/errors/app-error";

export const dynamic = "force-dynamic";
const customerSchema = z.object({
  email: z.string().email().max(320).optional(),
  name: z.string().trim().max(160).optional(),
  phone: z.string().trim().max(40).optional(),
  externalId: z.string().trim().min(1).max(160).optional(),
});

export async function GET(request: NextRequest) {
  try {
    const principal = await authenticateMerchantApiKey(request.headers.get("authorization"));
    if (!principal.scopes.includes("*") && !principal.scopes.includes("customers:read")) {
      throw new AppError("FORBIDDEN", "API key does not have customer read permission.", 403);
    }
    return NextResponse.json({ data: await listMerchantCustomers(principal.merchantId) }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const principal = await authenticateMerchantApiKey(request.headers.get("authorization"));
    if (!principal.scopes.includes("*") && !principal.scopes.includes("customers:write")) {
      throw new AppError("FORBIDDEN", "API key does not have customer write permission.", 403);
    }
    const body = customerSchema.parse(await request.json());
    const customer = await upsertMerchantCustomer({ merchantId: principal.merchantId, ...body });
    return NextResponse.json({ data: customer }, { status: 201, headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return errorResponse(error);
  }
}
