import "server-only";
import { prisma } from "@/server/infrastructure/database/prisma";
import { AppError } from "@/server/shared/errors/app-error";

/** Internal platform invoices are kept distinct from customer payment transactions. */
export async function createBillingInvoice(input: { merchantId: string; invoiceNumber: string; amountMinor: string; currency: string; description?: string; dueAt?: Date }) {
  if (!/^[1-9]\d{0,17}$/.test(input.amountMinor)) throw new AppError("VALIDATION_ERROR", "Invoice amount must be positive integer minor units.", 400);
  if (!/^[A-Za-z]{3}$/.test(input.currency)) throw new AppError("VALIDATION_ERROR", "Currency must be a three-letter code.", 400);
  return prisma.billingInvoice.create({ data: { merchantId: input.merchantId, invoiceNumber: input.invoiceNumber.trim().slice(0, 80), amountMinor: BigInt(input.amountMinor), currency: input.currency.toUpperCase(), description: input.description?.trim().slice(0, 500), dueAt } });
}

export async function listMerchantBillingInvoices(merchantId: string) {
  return prisma.billingInvoice.findMany({ where: { merchantId }, orderBy: { createdAt: "desc" }, take: 100, select: { id: true, invoiceNumber: true, amountMinor: true, currency: true, status: true, description: true, dueAt: true, paidAt: true, createdAt: true } });
}
