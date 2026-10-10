import "server-only";
import { createHash } from "node:crypto";
import { prisma } from "@/server/infrastructure/database/prisma";

const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 5;

function accountKey(email: string) {
  // Hash the normalized address so the throttling table does not store login input.
  return createHash("sha256").update(email.trim().toLowerCase()).digest("hex");
}

export async function isAdminLoginBlocked(email: string) {
  const row = await prisma.adminLoginAttempt.findUnique({ where: { emailKey: accountKey(email) } });
  return Boolean(row?.blockedUntil && row.blockedUntil > new Date());
}

export async function recordAdminLoginFailure(email: string) {
  const emailKey = accountKey(email);
  const now = new Date();
  const existing = await prisma.adminLoginAttempt.findUnique({ where: { emailKey } });

  if (!existing || now.getTime() - existing.windowStartedAt.getTime() >= WINDOW_MS) {
    await prisma.adminLoginAttempt.upsert({
      where: { emailKey },
      create: { emailKey, attempts: 1, windowStartedAt: now },
      update: { attempts: 1, windowStartedAt: now, blockedUntil: null },
    });
    return;
  }

  const attempts = existing.attempts + 1;
  await prisma.adminLoginAttempt.update({
    where: { emailKey },
    data: {
      attempts,
      blockedUntil: attempts >= MAX_ATTEMPTS ? new Date(now.getTime() + WINDOW_MS) : null,
    },
  });
}

export async function clearAdminLoginFailures(email: string) {
  await prisma.adminLoginAttempt.deleteMany({ where: { emailKey: accountKey(email) } });
}
