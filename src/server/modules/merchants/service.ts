import "server-only";
import { prisma } from "@/server/infrastructure/database/prisma";

/** Read models used by the admin console; payment execution stays in payments/providers. */
export async function getMerchantAdminOverview() {
  const [total, pending, review, active, restricted, recent] = await Promise.all([
    prisma.merchant.count(),
    prisma.merchant.count({ where: { status: "PENDING" } }),
    prisma.merchant.count({ where: { status: "UNDER_REVIEW" } }),
    prisma.merchant.count({ where: { status: "ACTIVE" } }),
    prisma.merchant.count({ where: { status: { in: ["RESTRICTED", "SUSPENDED"] } } }),
    prisma.merchant.findMany({ orderBy: { createdAt: "desc" }, take: 50, select: { id: true, name: true, slug: true, status: true, countryCode: true, createdAt: true } }),
  ]);
  return { counts: { total, pending, review, active, restricted }, recent };
}
