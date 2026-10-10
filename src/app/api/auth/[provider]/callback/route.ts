import { NextRequest, NextResponse } from "next/server";
import { env } from "@/lib/env";
import { getCallbackUrl, getOAuthConfig } from "@/server/modules/auth/oauth-config";
import { createSession, OAuthAccountConflictError, resolveOAuthUser } from "@/server/modules/auth/oauth-service";
import {
  AUTH_SESSION_COOKIE,
  AUTH_SESSION_MAX_AGE_SECONDS,
  oauthStateCookieName,
  openOAuthState,
  safeEqual,
  secureCookieOptions,
} from "@/server/modules/auth/oauth-state";
import type { OAuthIdentity, OAuthProvider } from "@/server/modules/auth/types";

export const dynamic = "force-dynamic";

type TokenResponse = { access_token?: string; token_type?: string; error?: string };
type GoogleProfile = { sub?: string; email?: string; email_verified?: boolean; name?: string; picture?: string };
type GitHubProfile = { id?: number; login?: string; name?: string | null; avatar_url?: string | null; email?: string | null };
type GitHubEmail = { email?: string; primary?: boolean; verified?: boolean };

function isProvider(value: string): value is OAuthProvider {
  return value === "google" || value === "github";
}

function loginRedirect(code: string): NextResponse {
  const url = new URL("/login", env.APP_URL);
  url.searchParams.set("error", code);
  const response = NextResponse.redirect(url);
  response.headers.set("Cache-Control", "no-store");
  return response;
}

async function exchangeCode(provider: OAuthProvider, code: string, verifier: string): Promise<string> {
  const config = getOAuthConfig(provider);
  if (!config) throw new Error("OAuth provider is not configured.");
  const response = await fetch(config.tokenEndpoint, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded", Accept: "application/json" },
    body: new URLSearchParams({
      client_id: config.clientId,
      client_secret: config.clientSecret,
      code,
      redirect_uri: getCallbackUrl(provider),
      grant_type: "authorization_code",
      code_verifier: verifier,
    }),
    cache: "no-store",
    signal: AbortSignal.timeout(10_000),
  });
  if (!response.ok) throw new Error("OAuth token exchange failed.");
  const payload = (await response.json()) as TokenResponse;
  if (!payload.access_token || payload.error) throw new Error("OAuth token response was invalid.");
  return payload.access_token;
}

async function fetchIdentity(provider: OAuthProvider, accessToken: string): Promise<OAuthIdentity> {
  if (provider === "google") {
    const response = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
      headers: { Authorization: `Bearer ${accessToken}`, Accept: "application/json" },
      cache: "no-store",
      signal: AbortSignal.timeout(10_000),
    });
    if (!response.ok) throw new Error("Could not retrieve Google profile.");
    const profile = (await response.json()) as GoogleProfile;
    if (!profile.sub || !profile.email || profile.email_verified !== true) throw new Error("Google did not return a verified identity.");
    return {
      provider,
      providerAccountId: profile.sub,
      email: profile.email,
      name: profile.name ?? null,
      image: profile.picture ?? null,
      emailVerified: true,
    };
  }

  const headers = { Authorization: `Bearer ${accessToken}`, Accept: "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28" };
  const [profileResponse, emailsResponse] = await Promise.all([
    fetch("https://api.github.com/user", { headers, cache: "no-store", signal: AbortSignal.timeout(10_000) }),
    fetch("https://api.github.com/user/emails", { headers, cache: "no-store", signal: AbortSignal.timeout(10_000) }),
  ]);
  if (!profileResponse.ok || !emailsResponse.ok) throw new Error("Could not retrieve GitHub profile.");
  const profile = (await profileResponse.json()) as GitHubProfile;
  const emails = (await emailsResponse.json()) as GitHubEmail[];
  const primary = emails.find((item) => item.primary && item.verified && item.email);
  if (!profile.id || !primary?.email) throw new Error("GitHub did not return a verified primary email.");
  return {
    provider,
    providerAccountId: String(profile.id),
    email: primary.email,
    name: profile.name?.trim() || profile.login || null,
    image: profile.avatar_url ?? null,
    emailVerified: true,
  };
}

export async function GET(request: NextRequest, context: { params: Promise<{ provider: string }> }) {
  const { provider: rawProvider } = await context.params;
  if (!isProvider(rawProvider)) return NextResponse.json({ error: "Unsupported authentication provider." }, { status: 404 });

  const cookieName = oauthStateCookieName(rawProvider);
  const clearStateCookie = (response: NextResponse) => {
    response.cookies.set(cookieName, "", { ...secureCookieOptions(0), expires: new Date(0) });
    return response;
  };

  const providerError = request.nextUrl.searchParams.get("error");
  const code = request.nextUrl.searchParams.get("code");
  const returnedState = request.nextUrl.searchParams.get("state");
  const cookieValue = request.cookies.get(cookieName)?.value;
  const stored = cookieValue ? openOAuthState(cookieValue) : null;

  if (providerError) return clearStateCookie(loginRedirect("oauth_canceled"));
  if (!code || !returnedState || !stored || stored.provider !== rawProvider || !safeEqual(returnedState, stored.state)) {
    return clearStateCookie(loginRedirect("oauth_state_invalid"));
  }

  try {
    const accessToken = await exchangeCode(rawProvider, code, stored.verifier);
    const identity = await fetchIdentity(rawProvider, accessToken);
    const user = await resolveOAuthUser(identity);
    const session = await createSession(user.id);
    const response = NextResponse.redirect(new URL("/dashboard", env.APP_URL));
    response.cookies.set(AUTH_SESSION_COOKIE, session.token, {
      ...secureCookieOptions(AUTH_SESSION_MAX_AGE_SECONDS),
      expires: session.expiresAt,
    });
    response.headers.set("Cache-Control", "no-store");
    return clearStateCookie(response);
  } catch (error) {
    if (error instanceof OAuthAccountConflictError) return clearStateCookie(loginRedirect("account_conflict"));
    // Never include provider payloads, tokens, or exception text in the browser redirect.
    console.error("OAuth callback failed", { provider: rawProvider, errorType: error instanceof Error ? error.name : "UnknownError" });
    return clearStateCookie(loginRedirect("oauth_failed"));
  }
}
