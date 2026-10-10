import "server-only";
import { prisma } from "@/server/infrastructure/database/prisma";

export async function listAdminBillingInvoices(take = 100) {
  return prisma.billingInvoice.findMany({
    orderBy: { createdAt: "desc" },
    take: Math.min(Math.max(take, 1), 200),
    select: { id: true, merchantId: true, invoiceNumber: true, amountMinor: true, currency: true, status: true, dueAt: true, paidAt: true, createdAt: true },
  });
}
