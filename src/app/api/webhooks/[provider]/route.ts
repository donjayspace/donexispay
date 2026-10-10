import { NextRequest, NextResponse } from "next/server";
import { providerWebhookRegistry } from "@/server/modules/webhooks/registry";
import { recordVerifiedProviderEvent } from "@/server/modules/webhooks/receive-service";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
const MAX_BODY_BYTES = 1024 * 1024;

/**
 * Generic ingress deliberately rejects unknown providers. A provider-specific
 * adapter must verify signatures and minimize its payload before any persistence.
 */
export async function POST(request: NextRequest, context: { params: Promise<{ provider: string }> }) {
  const { provider } = await context.params;
  if (!/^[a-z0-9][a-z0-9_-]{1,63}$/.test(provider)) {
    return NextResponse.json({ error: "Unsupported provider." }, { status: 404, headers: { "Cache-Control": "no-store" } });
  }

  const adapter = providerWebhookRegistry.get(provider);
  if (!adapter) {
    return NextResponse.json({ error: "Webhook provider is not configured." }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }

  const contentLength = Number(request.headers.get("content-length") ?? "0");
  if (Number.isFinite(contentLength) && contentLength > MAX_BODY_BYTES) {
    return NextResponse.json({ error: "Webhook body is too large." }, { status: 413, headers: { "Cache-Control": "no-store" } });
  }

  const rawBody = await request.text();
  if (Buffer.byteLength(rawBody, "utf8") > MAX_BODY_BYTES) {
    return NextResponse.json({ error: "Webhook body is too large." }, { status: 413, headers: { "Cache-Control": "no-store" } });
  }

  try {
    // Signature verification and provider-specific normalization happen before database writes.
    const verified = await adapter.verifyAndNormalize(request, rawBody);
    if (adapter.providerId !== provider || !verified.eventId || verified.eventId.length > 200 || !verified.eventType || verified.eventType.length > 160) {
      return NextResponse.json({ error: "Invalid provider event." }, { status: 400, headers: { "Cache-Control": "no-store" } });
    }
    const result = await recordVerifiedProviderEvent(provider, verified);
    return NextResponse.json(
      { received: true, duplicate: result.duplicate },
      { status: 200, headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    // Do not echo raw payloads, signature values, or provider error details to callers.
    console.error("Provider webhook rejected", { provider, errorType: error instanceof Error ? error.name : "UnknownError" });
    return NextResponse.json({ error: "Webhook could not be verified or stored." }, { status: 400, headers: { "Cache-Control": "no-store" } });
  }
}
