import "server-only";
import type { OAuthProvider } from "./types";
import { env } from "@/lib/env";

type ProviderConfig = {
  clientId: string;
  clientSecret: string;
  authorizationEndpoint: string;
  tokenEndpoint: string;
  scopes: string[];
};

export function getOAuthConfig(provider: OAuthProvider): ProviderConfig | null {
  if (provider === "google") {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    if (!clientId || !clientSecret) return null;
    return {
      clientId,
      clientSecret,
      authorizationEndpoint: "https://accounts.google.com/o/oauth2/v2/auth",
      tokenEndpoint: "https://oauth2.googleapis.com/token",
      scopes: ["openid", "email", "profile"],
    };
  }

  const clientId = process.env.GITHUB_CLIENT_ID;
  const clientSecret = process.env.GITHUB_CLIENT_SECRET;
  if (!clientId || !clientSecret) return null;
  return {
    clientId,
    clientSecret,
    authorizationEndpoint: "https://github.com/login/oauth/authorize",
    tokenEndpoint: "https://github.com/login/oauth/access_token",
    scopes: ["read:user", "user:email"],
  };
}

export function getCallbackUrl(provider: OAuthProvider): string {
  return new URL(`/api/auth/${provider}/callback`, env.APP_URL).toString();
}
