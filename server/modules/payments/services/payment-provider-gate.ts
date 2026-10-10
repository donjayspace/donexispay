import "server-only";
import { env } from "@/server/infrastructure/config/env";
import { AppError } from "@/server/shared/errors/app-error";

export function assertLivePaymentsEnabled(): void {
  if (!env.PAYMENTS_LIVE_ENABLED) {
    throw new AppError(
      "PAYMENTS_DISABLED",
      "Live payment execution is disabled in this environment.",
      503,
    );
  }
}
