import "server-only";
import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";
import { env } from "@/lib/env";

const KEY = createHash("sha256").update(env.APP_SECRET, "utf8").digest();

/**
 * Encrypt short-lived sensitive values that must be replayed idempotently.
 * Never use this helper for passwords; passwords require a password hashing function.
 */
export function encryptSensitiveValue(plaintext: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", KEY, iv);
  const ciphertext = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();

  return [iv.toString("base64url"), tag.toString("base64url"), ciphertext.toString("base64url")].join(".");
}

export function decryptSensitiveValue(envelope: string): string {
  const [ivText, tagText, ciphertextText] = envelope.split(".");
  if (!ivText || !tagText || !ciphertextText) throw new Error("Invalid encrypted envelope.");

  const decipher = createDecipheriv("aes-256-gcm", KEY, Buffer.from(ivText, "base64url"));
  decipher.setAuthTag(Buffer.from(tagText, "base64url"));

  return Buffer.concat([
    decipher.update(Buffer.from(ciphertextText, "base64url")),
    decipher.final(),
  ]).toString("utf8");
}
