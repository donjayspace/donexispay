import "server-only";
import { prisma } from "@/server/infrastructure/database/prisma";
import { verifyAdminPassword } from "./password";
import type { AuthenticatedAdmin } from "./types";

/**
 * Returns one generic error for unknown, disabled, and invalid-password accounts.
 * This avoids making the admin login endpoint an account-enumeration oracle.
 */
export async function authenticateAdmin(emailInput: string, password: string): Promise<AuthenticatedAdmin | null> {
  const email = emailInput.trim().toLowerCase();
  if (!email || email.length > 320 || password.length > 1024) return null;

  const admin = await prisma.adminUser.findUnique({ where: { email } });
  if (!admin) return null;
  const passwordMatches = await verifyAdminPassword(password, admin.passwordHash);
  if (!passwordMatches || admin.disabledAt) return null;

  await prisma.$transaction([
    prisma.adminUser.update({ where: { id: admin.id }, data: { lastLoginAt: new Date() } }),
    prisma.auditLog.create({
      data: {
        actorType: "ADMIN",
        actorId: admin.id,
        action: "ADMIN_LOGIN",
        targetType: "ADMIN_USER",
        targetId: admin.id,
        outcome: "SUCCESS",
      },
    }),
  ]);

  return { id: admin.id, email: admin.email, displayName: admin.displayName, role: admin.role };
}
