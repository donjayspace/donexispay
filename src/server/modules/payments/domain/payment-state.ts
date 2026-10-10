import { AppError } from "@/server/shared/errors/app-error";

export type InternalPaymentStatus =
  | "CREATED"
  | "REQUIRES_ACTION"
  | "PROCESSING"
  | "SUCCEEDED"
  | "FAILED"
  | "CANCELED"
  | "EXPIRED"
  | "REQUIRES_REVIEW";

const transitions: Record<InternalPaymentStatus, readonly InternalPaymentStatus[]> = {
  CREATED: ["REQUIRES_ACTION", "PROCESSING", "SUCCEEDED", "FAILED", "CANCELED", "EXPIRED", "REQUIRES_REVIEW"],
  REQUIRES_ACTION: ["PROCESSING", "SUCCEEDED", "FAILED", "CANCELED", "EXPIRED", "REQUIRES_REVIEW"],
  PROCESSING: ["SUCCEEDED", "FAILED", "CANCELED", "REQUIRES_REVIEW"],
  SUCCEEDED: [],
  FAILED: [],
  CANCELED: [],
  EXPIRED: [],
  REQUIRES_REVIEW: ["PROCESSING", "SUCCEEDED", "FAILED", "CANCELED"],
};

export function assertPaymentTransition(
  current: InternalPaymentStatus,
  next: InternalPaymentStatus,
): void {
  if (current === next) return;

  if (!transitions[current].includes(next)) {
    throw new AppError(
      "CONFLICT",
      `Payment transition from ${current} to ${next} is not permitted.`,
      409,
    );
  }
}
