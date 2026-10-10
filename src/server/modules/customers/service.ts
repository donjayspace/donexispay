import "server-only";
import { prisma } from "@/server/infrastructure/database/prisma";
import { AppError } from "@/server/shared/errors/app-error";

/** Customer records are scoped by merchantId on every query to prevent cross-merchant access. */
export async function upsertMerchantCustomer(input: { merchantId: string; email?: string; name?: string; phone?: string; externalId?: string }) {
  const email = input.email?.trim().toLowerCase();
  if (email && (email.length > 320 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))) {
    throw new AppError("VALIDATION_ERROR", "A valid email address is required.", 400);
  }
  if (input.externalId) {
    return prisma.customer.upsert({
      where: { merchantId_externalId: { merchantId: input.merchantId, externalId: input.externalId } },
      create: { merchantId: input.merchantId, email, name: input.name?.trim().slice(0, 160), phone: input.phone?.trim().slice(0, 40), externalId: input.externalId.slice(0, 160) },
      update: { email, name: input.name?.trim().slice(0, 160), phone: input.phone?.trim().slice(0, 40) },
    });
  }
  if (!email) throw new AppError("VALIDATION_ERROR", "Provide an email or external customer reference.", 400);
  return prisma.customer.create({ data: { merchantId: input.merchantId, email, name: input.name?.trim().slice(0, 160), phone: input.phone?.trim().slice(0, 40) } });
}

export async function listMerchantCustomers(merchantId: string, take = 50) {
  return prisma.customer.findMany({
    where: { merchantId },
    orderBy: { createdAt: "desc" },
    take: Math.min(Math.max(take, 1), 100),
    select: { id: true, email: true, name: true, phone: true, externalId: true, createdAt: true, updatedAt: true },
  });
}
