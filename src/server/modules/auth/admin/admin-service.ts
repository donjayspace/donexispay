import "server-only";
import { prisma } from "@/server/infrastructure/database/prisma";

/** Administrator listing never selects password hashes or active session tokens. */
export async function listAdministratorAccounts() {
  return prisma.adminUser.findMany({
    orderBy: { createdAt: "desc" },
    select: { id: true, email: true, displayName: true, role: true, disabledAt: true, lastLoginAt: true, createdAt: true, _count: { select: { sessions: true } } },
  });
}
