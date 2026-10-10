import "server-only";
import { prisma } from "@/server/infrastructure/database/prisma";
import { AppError } from "@/server/shared/errors/app-error";

/** Risk decisions require a separately authenticated admin workflow and leave an audit record. */
export async function openRiskReview(paymentId: string, reasonCode: string, score?: number) {
  const payment = await prisma.payment.findUnique({ where: { id: paymentId }, select: { id: true } });
  if (!payment) throw new AppError("NOT_FOUND", "Payment not found.", 404);
  if (score !== undefined && (!Number.isInteger(score) || score < 0 || score > 1000)) throw new AppError("VALIDATION_ERROR", "Risk score must be an integer from 0 to 1000.", 400);
  return prisma.riskReview.upsert({
    where: { paymentId },
    create: { paymentId, reasonCode: reasonCode.trim().slice(0, 100), score, status: "OPEN" },
    update: { reasonCode: reasonCode.trim().slice(0, 100), score, status: "OPEN", notes: null, reviewedByAdminId: null, reviewedAt: null },
  });
}

export async function decideRiskReview(input: { reviewId: string; adminId: string; status: "APPROVED" | "DECLINED" | "NEEDS_INFORMATION"; notes?: string }) {
  const review = await prisma.$transaction(async (tx) => {
    const updated = await tx.riskReview.update({
      where: { id: input.reviewId },
      data: { status: input.status, notes: input.notes?.trim().slice(0, 2000), reviewedByAdminId: input.adminId, reviewedAt: new Date() },
    });
    await tx.auditLog.create({ data: { actorType: "ADMIN", actorId: input.adminId, action: "RISK_REVIEW_DECIDED", targetType: "RISK_REVIEW", targetId: updated.id, outcome: "SUCCESS", metadata: { status: input.status } } });
    return updated;
  });
  return review;
}
