import "server-only";
import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";

const KEY_LENGTH = 64;
const SALT_LENGTH = 16;
const SCRYPT_OPTIONS = { N: 1 << 15, r: 8, p: 1, maxmem: 64 * 1024 * 1024 };

/** Promise wrapper preserves Node's scrypt options overload in TypeScript. */
function deriveKey(password: string, salt: Buffer, keyLength: number): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scryptCallback(password, salt, keyLength, SCRYPT_OPTIONS, (error, key) => {
      if (error) reject(error);
      else resolve(key);
    });
  });
}

/**
 * Scrypt is a built-in, memory-hard password KDF. The stored string contains
 * its salt and derived key, never the original password.
 */
export async function hashAdminPassword(password: string): Promise<string> {
  const salt = randomBytes(SALT_LENGTH);
  const key = await deriveKey(password, salt, KEY_LENGTH);
  return `scrypt:${salt.toString("base64url")}:${key.toString("base64url")}`;
}

export async function verifyAdminPassword(password: string, stored: string): Promise<boolean> {
  const [algorithm, saltEncoded, keyEncoded, extra] = stored.split(":");
  if (algorithm !== "scrypt" || !saltEncoded || !keyEncoded || extra !== undefined) return false;

  try {
    const salt = Buffer.from(saltEncoded, "base64url");
    const expected = Buffer.from(keyEncoded, "base64url");
    if (salt.length !== SALT_LENGTH || expected.length !== KEY_LENGTH) return false;
    const actual = await deriveKey(password, salt, expected.length);
    return timingSafeEqual(actual, expected);
  } catch {
    return false;
  }
}
