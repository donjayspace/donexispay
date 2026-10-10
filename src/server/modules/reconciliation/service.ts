import "server-only";
import { prisma } from "@/server/infrastructure/database/prisma";
import { AppError } from "@/server/shared/errors/app-error";

export type StatementRow = { externalReference: string; currency: string; amountMinor: string; internalReference?: string };

/**
 * Persists a reconciliation snapshot and per-row exceptions in one transaction.
 * It deliberately does not mutate payment statuses or silently adjust ledger values.
 */
export async function createReconciliationRun(providerId: string, rows: StatementRow[]) {
  if (!providerId.trim() || providerId.length > 80) throw new AppError("VALIDATION_ERROR", "Provider ID is required.", 400);
  if (rows.length > 10000) throw new AppError("VALIDATION_ERROR", "A reconciliation run is limited to 10,000 rows.", 413);
  for (const row of rows) {
    if (!row.externalReference || row.externalReference.length > 200 || !/^[A-Za-z]{3}$/.test(row.currency) || !/^-?\d{1,18}$/.test(row.amountMinor)) {
      throw new AppError("VALIDATION_ERROR", "A statement row has invalid reference, currency, or amount.", 400);
    }
  }

  const startedAt = new Date();
  return prisma.$transaction(async (tx) => {
    const run = await tx.reconciliationRun.create({ data: { providerId, status: "RUNNING", startedAt, totalRecords: rows.length } });
    let matchedRecords = 0;
    const items = [];
    for (const row of rows) {
      const amount = BigInt(row.amountMinor);
      const payment = row.internalReference
        ? await tx.payment.findFirst({ where: { id: row.internalReference, providerId }, select: { id: true, amountMinor: true, currency: true } })
        : await tx.payment.findFirst({ where: { providerPaymentId: row.externalReference, providerId }, select: { id: true, amountMinor: true, currency: true } });
      const matched = Boolean(payment && payment.currency === row.currency.toUpperCase() && payment.amountMinor === amount);
      if (matched) matchedRecords++;
      items.push({
        runId: run.id,
        externalReference: row.externalReference,
        internalReference: payment?.id ?? row.internalReference,
        currency: row.currency.toUpperCase(),
        externalAmountMinor: amount,
        internalAmountMinor: payment?.amountMinor ?? null,
        matched,
        exceptionCode: matched ? null : payment ? "AMOUNT_OR_CURRENCY_MISMATCH" : "PAYMENT_NOT_FOUND",
      });
    }
    await tx.reconciliationItem.createMany({ data: items });
    const completed = await tx.reconciliationRun.update({
      where: { id: run.id },
      data: { status: "COMPLETED", completedAt: new Date(), matchedRecords, exceptionCount: rows.length - matchedRecords, summary: { totalRecords: rows.length, matchedRecords, exceptionCount: rows.length - matchedRecords } },
    });
    await tx.auditLog.create({ data: { actorType: "SYSTEM", action: "RECONCILIATION_COMPLETED", targetType: "RECONCILIATION_RUN", targetId: run.id, outcome: "SUCCESS", metadata: { providerId, totalRecords: rows.length, matchedRecords } } });
    return completed;
  });
}

export async function listReconciliationRuns(take = 50) {
  return prisma.reconciliationRun.findMany({ orderBy: { createdAt: "desc" }, take: Math.min(Math.max(take, 1), 100), select: { id: true, providerId: true, status: true, totalRecords: true, matchedRecords: true, exceptionCount: true, startedAt: true, completedAt: true, createdAt: true } });
}
