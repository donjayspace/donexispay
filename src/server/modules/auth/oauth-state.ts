import "server-only";
import { createCipheriv, createDecipheriv, createHash, randomBytes, timingSafeEqual } from "node:crypto";
import type { OAuthProvider } from "./types";
import { env } from "@/lib/env";

export const OAUTH_STATE_COOKIE_PREFIX = "donexispay_oauth_";
export const AUTH_SESSION_COOKIE = "donexispay_session";
export const AUTH_SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;
export const OAUTH_STATE_MAX_AGE_SECONDS = 60 * 10;

export type OAuthStatePayload = {
  provider: OAuthProvider;
  state: string;
  verifier: string;
  createdAt: number;
};

function encryptionKey(): Buffer {
  return createHash("sha256").update(env.APP_SECRET, "utf8").digest();
}

export function sealOAuthState(payload: OAuthStatePayload): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", encryptionKey(), iv);
  const ciphertext = Buffer.concat([cipher.update(JSON.stringify(payload), "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return [iv, tag, ciphertext].map((part) => part.toString("base64url")).join(".");
}

export function openOAuthState(value: string): OAuthStatePayload | null {
  try {
    const parts = value.split(".");
    if (parts.length !== 3) return null;
    const [ivEncoded, tagEncoded, ciphertextEncoded] = parts;
    const iv = Buffer.from(ivEncoded, "base64url");
    const tag = Buffer.from(tagEncoded, "base64url");
    const ciphertext = Buffer.from(ciphertextEncoded, "base64url");
    if (iv.length !== 12 || tag.length !== 16 || ciphertext.length > 4096) return null;
    const decipher = createDecipheriv("aes-256-gcm", encryptionKey(), iv);
    decipher.setAuthTag(tag);
    const plain = Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString("utf8");
    const payload = JSON.parse(plain) as Partial<OAuthStatePayload>;
    if ((payload.provider !== "google" && payload.provider !== "github") ||
        typeof payload.state !== "string" || typeof payload.verifier !== "string" ||
        typeof payload.createdAt !== "number") return null;
    if (Date.now() - payload.createdAt > OAUTH_STATE_MAX_AGE_SECONDS * 1000 ||
        payload.createdAt > Date.now() + 30_000) return null;
    return payload as OAuthStatePayload;
  } catch {
    return null;
  }
}

export function safeEqual(a: string, b: string): boolean {
  const left = Buffer.from(a, "utf8");
  const right = Buffer.from(b, "utf8");
  return left.length === right.length && timingSafeEqual(left, right);
}

export function hashOpaqueToken(token: string): string {
  return createHash("sha256").update(token, "utf8").digest("hex");
}

export function createOpaqueToken(): string {
  return randomBytes(32).toString("base64url");
}

export function oauthStateCookieName(provider: OAuthProvider): string {
  return `${OAUTH_STATE_COOKIE_PREFIX}${provider}`;
}

export function secureCookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge,
  };
}
