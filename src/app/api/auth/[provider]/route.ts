import { createHash, randomBytes } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { env } from "@/lib/env";
import { getCallbackUrl, getOAuthConfig } from "@/server/modules/auth/oauth-config";
import {
  OAUTH_STATE_MAX_AGE_SECONDS,
  oauthStateCookieName,
  sealOAuthState,
  secureCookieOptions,
} from "@/server/modules/auth/oauth-state";
import type { OAuthProvider } from "@/server/modules/auth/types";

export const dynamic = "force-dynamic";

function isProvider(value: string): value is OAuthProvider {
  return value === "google" || value === "github";
}

export async function GET(request: NextRequest, context: { params: Promise<{ provider: string }> }) {
  const { provider: rawProvider } = await context.params;
  if (!isProvider(rawProvider)) return NextResponse.json({ error: "Unsupported authentication provider." }, { status: 404 });

  const config = getOAuthConfig(rawProvider);
  if (!config) {
    const target = new URL("/login", env.APP_URL);
    target.searchParams.set("error", "provider_unavailable");
    return NextResponse.redirect(target);
  }

  const state = randomBytes(32).toString("base64url");
  const verifier = randomBytes(32).toString("base64url");
  const challenge = createHash("sha256").update(verifier).digest("base64url");
  const stateCookie = sealOAuthState({ provider: rawProvider, state, verifier, createdAt: Date.now() });

  const authorization = new URL(config.authorizationEndpoint);
  authorization.searchParams.set("client_id", config.clientId);
  authorization.searchParams.set("redirect_uri", getCallbackUrl(rawProvider));
  authorization.searchParams.set("response_type", "code");
  authorization.searchParams.set("scope", config.scopes.join(" "));
  authorization.searchParams.set("state", state);
  authorization.searchParams.set("code_challenge", challenge);
  authorization.searchParams.set("code_challenge_method", "S256");
  if (rawProvider === "google") authorization.searchParams.set("prompt", "select_account");

  const response = NextResponse.redirect(authorization);
  response.cookies.set(oauthStateCookieName(rawProvider), stateCookie, secureCookieOptions(OAUTH_STATE_MAX_AGE_SECONDS));
  response.headers.set("Cache-Control", "no-store");
  return response;
}
