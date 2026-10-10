import "server-only";
import { prisma } from "@/server/infrastructure/database/prisma";

/** Admin user views never expose OAuth access tokens or authentication session tokens. */
export async function getUserAdminOverview() {
  const [total, verified, disabled, recent] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { emailVerified: { not: null } } }),
    prisma.user.count({ where: { disabledAt: { not: null } } }),
    prisma.user.findMany({ orderBy: { createdAt: "desc" }, take: 100, select: { id: true, email: true, name: true, image: true, emailVerified: true, disabledAt: true, createdAt: true, _count: { select: { oauthAccounts: true, sessions: true } } } }),
  ]);
  return { counts: { total, verified, disabled }, recent };
}
