import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/server/modules/auth";
import { createMerchantWorkspace, listUserMerchantWorkspaces } from "@/server/modules/onboarding/service";
import { errorResponse } from "@/server/infrastructure/security/api-response";

export const dynamic = "force-dynamic";
const schema = z.object({
  businessName: z.string().trim().min(2).max(120),
  countryCode: z.string().trim().regex(/^[A-Za-z]{2}$/).optional(),
});

/** Customer OAuth session required; this endpoint can create merchant workspaces, never admin accounts. */
export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: { code: "UNAUTHENTICATED", message: "Sign in is required." } }, { status: 401, headers: { "Cache-Control": "no-store" } });
  const workspaces = await listUserMerchantWorkspaces(user.id);
  return NextResponse.json({ data: workspaces }, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: { code: "UNAUTHENTICATED", message: "Sign in is required." } }, { status: 401, headers: { "Cache-Control": "no-store" } });

  try {
    const body = schema.parse(await request.json());
    const merchant = await createMerchantWorkspace({ userId: user.id, ...body });
    return NextResponse.json({ data: merchant }, { status: 201, headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return errorResponse(error);
  }
}
