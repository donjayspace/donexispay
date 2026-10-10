import dotenv from "dotenv";
// Next.js local development commonly stores variables in .env.local.
dotenv.config({ path: ".env.local" });
dotenv.config();
import { randomBytes, scrypt as scryptCallback } from "node:crypto";
import { promisify } from "node:util";
import { PrismaClient } from "@prisma/client";

const scrypt = promisify(scryptCallback);
const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_BOOTSTRAP_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_BOOTSTRAP_PASSWORD;
  const displayName = process.env.ADMIN_BOOTSTRAP_NAME?.trim() || "Platform Administrator";

  if (!email || !password) {
    throw new Error("Set ADMIN_BOOTSTRAP_EMAIL and ADMIN_BOOTSTRAP_PASSWORD before running this one-time script.");
  }
  if (password.length < 14 || password.length > 1024) {
    throw new Error("ADMIN_BOOTSTRAP_PASSWORD must be between 14 and 1024 characters.");
  }

  // The bootstrap script creates the first admin only. It deliberately refuses
  // to overwrite an existing account so deployments cannot reset passwords accidentally.
  const existing = await prisma.adminUser.findUnique({ where: { email }, select: { id: true } });
  if (existing) throw new Error("An administrator with this email already exists; use the audited admin-management process.");

  const salt = randomBytes(16);
  const key = await scrypt(password, salt, 64, { N: 1 << 15, r: 8, p: 1, maxmem: 64 * 1024 * 1024 });
  const passwordHash = `scrypt:${salt.toString("base64url")}:${Buffer.from(key).toString("base64url")}`;

  const admin = await prisma.$transaction(async (tx) => {
    const created = await tx.adminUser.create({
      data: { email, displayName, passwordHash, role: "SUPER_ADMIN" },
      select: { id: true, email: true, role: true },
    });
    await tx.auditLog.create({
      data: {
        actorType: "SYSTEM",
        actorId: null,
        action: "ADMIN_BOOTSTRAP_CREATED",
        targetType: "ADMIN_USER",
        targetId: created.id,
        outcome: "SUCCESS",
        metadata: { email: created.email, role: created.role },
      },
    });
    return created;
  });
  console.log(`Created first administrator: ${admin.email} (${admin.role}). Remove bootstrap credentials from the environment now.`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : "Administrator bootstrap failed.");
  process.exitCode = 1;
}).finally(async () => prisma.$disconnect());
