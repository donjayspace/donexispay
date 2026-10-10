import "server-only";
import { Prisma } from "@prisma/client";
import { prisma } from "@/server/infrastructure/database/prisma";
import { AppError } from "@/server/shared/errors/app-error";

function slugify(value: string) {
  return value.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 48);
}

/**
 * Creates a merchant and its OWNER membership atomically.
 * The user becomes an owner of this merchant, not an administrator of DonexisPay.
 */
export async function createMerchantWorkspace(input: { userId: string; businessName: string; countryCode?: string }) {
  const name = input.businessName.trim();
  if (name.length < 2 || name.length > 120) throw new AppError("VALIDATION_ERROR", "Business name must be between 2 and 120 characters.", 400);
  const countryCode = input.countryCode?.trim().toUpperCase();
  if (countryCode && !/^[A-Z]{2}$/.test(countryCode)) throw new AppError("VALIDATION_ERROR", "Country must be a two-letter ISO code.", 400);

  const base = slugify(name) || "merchant";
  const slug = `${base}-${crypto.randomUUID().slice(0, 8)}`;

  try {
    return await prisma.$transaction(async (tx) => {
      const merchant = await tx.merchant.create({ data: { name, slug, countryCode } });
      await tx.merchantMember.create({ data: { merchantId: merchant.id, userId: input.userId, role: "OWNER" } });
      await tx.auditLog.create({ data: {
        actorType: "USER", actorId: input.userId, action: "MERCHANT_WORKSPACE_CREATED",
        targetType: "MERCHANT", targetId: merchant.id, outcome: "SUCCESS",
      } });
      return merchant;
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      throw new AppError("CONFLICT", "A workspace with these details already exists. Please retry.", 409);
    }
    throw error;
  }
}

export async function listUserMerchantWorkspaces(userId: string) {
  return prisma.merchantMember.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    select: { role: true, createdAt: true, merchant: { select: { id: true, name: true, slug: true, status: true, countryCode: true } } },
  });
}
