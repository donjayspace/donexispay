import "server-only";
import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const scrypt = promisify(scryptCallback);
const KEY_LENGTH = 64;
const SALT_LENGTH = 16;

/**
 * Scrypt is a built-in, memory-hard password KDF. The stored string contains
 * its salt and derived key, never the original password.
 */
export async function hashAdminPassword(password: string): Promise<string> {
  const salt = randomBytes(SALT_LENGTH);
  const key = (await scrypt(password, salt, KEY_LENGTH, { N: 1 << 15, r: 8, p: 1, maxmem: 64 * 1024 * 1024 })) as Buffer;
  return `scrypt:${salt.toString("base64url")}:${key.toString("base64url")}`;
}

export async function verifyAdminPassword(password: string, stored: string): Promise<boolean> {
  const [algorithm, saltEncoded, keyEncoded, extra] = stored.split(":");
  if (algorithm !== "scrypt" || !saltEncoded || !keyEncoded || extra !== undefined) return false;

  try {
    const salt = Buffer.from(saltEncoded, "base64url");
    const expected = Buffer.from(keyEncoded, "base64url");
    if (salt.length !== SALT_LENGTH || expected.length !== KEY_LENGTH) return false;
    const actual = (await scrypt(password, salt, expected.length, { N: 1 << 15, r: 8, p: 1, maxmem: 64 * 1024 * 1024 })) as Buffer;
    return timingSafeEqual(actual, expected);
  } catch {
    return false;
  }
}
