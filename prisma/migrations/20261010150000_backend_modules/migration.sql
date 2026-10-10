ALTER TABLE "Payment" ADD COLUMN "providerRedirectUrl" TEXT;

-- Durable data models for the modular payment-orchestration backend.
CREATE TYPE "RefundStatus" AS ENUM ('REQUESTED', 'PENDING', 'SUCCEEDED', 'FAILED', 'CANCELED');
CREATE TYPE "PaymentLinkStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'EXPIRED');
CREATE TYPE "BillingInvoiceStatus" AS ENUM ('DRAFT', 'OPEN', 'PAID', 'VOID', 'OVERDUE');
CREATE TYPE "SettlementStatus" AS ENUM ('PENDING', 'PROCESSING', 'SETTLED', 'FAILED');
CREATE TYPE "ReconciliationStatus" AS ENUM ('QUEUED', 'RUNNING', 'COMPLETED', 'FAILED');
CREATE TYPE "RiskReviewStatus" AS ENUM ('OPEN', 'APPROVED', 'DECLINED', 'NEEDS_INFORMATION');
CREATE TYPE "MerchantMemberRole" AS ENUM ('OWNER', 'ADMIN', 'DEVELOPER', 'VIEWER');

CREATE TABLE "Customer" (
  "id" TEXT NOT NULL, "merchantId" TEXT NOT NULL, "email" TEXT, "name" TEXT, "phone" TEXT,
  "externalId" TEXT, "metadata" JSONB, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL, CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "MerchantMember" (
  "id" TEXT NOT NULL, "merchantId" TEXT NOT NULL, "userId" TEXT NOT NULL,
  "role" "MerchantMemberRole" NOT NULL DEFAULT 'VIEWER', "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL, CONSTRAINT "MerchantMember_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "Refund" (
  "id" TEXT NOT NULL, "merchantId" TEXT NOT NULL, "paymentId" TEXT NOT NULL, "amountMinor" BIGINT NOT NULL,
  "currency" VARCHAR(3) NOT NULL, "status" "RefundStatus" NOT NULL DEFAULT 'REQUESTED', "reason" TEXT,
  "providerRefundId" TEXT, "idempotencyKey" TEXT NOT NULL, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL, "completedAt" TIMESTAMP(3), CONSTRAINT "Refund_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "PaymentLink" (
  "id" TEXT NOT NULL, "merchantId" TEXT NOT NULL, "name" TEXT NOT NULL, "tokenHash" TEXT NOT NULL,
  "amountMinor" BIGINT NOT NULL, "currency" VARCHAR(3) NOT NULL, "description" TEXT,
  "status" "PaymentLinkStatus" NOT NULL DEFAULT 'ACTIVE', "expiresAt" TIMESTAMP(3), "successUrl" TEXT,
  "cancelUrl" TEXT, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "PaymentLink_pkey" PRIMARY KEY ("id")
);
ALTER TABLE "CheckoutSession" ADD COLUMN "paymentLinkId" TEXT;

CREATE TABLE "BillingInvoice" (
  "id" TEXT NOT NULL, "merchantId" TEXT NOT NULL, "invoiceNumber" TEXT NOT NULL, "amountMinor" BIGINT NOT NULL,
  "currency" VARCHAR(3) NOT NULL, "status" "BillingInvoiceStatus" NOT NULL DEFAULT 'DRAFT', "description" TEXT,
  "dueAt" TIMESTAMP(3), "paidAt" TIMESTAMP(3), "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL, CONSTRAINT "BillingInvoice_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "Settlement" (
  "id" TEXT NOT NULL, "merchantId" TEXT, "providerId" TEXT NOT NULL, "providerReference" TEXT NOT NULL,
  "currency" VARCHAR(3) NOT NULL, "grossMinor" BIGINT NOT NULL, "feeMinor" BIGINT NOT NULL DEFAULT 0,
  "netMinor" BIGINT NOT NULL, "status" "SettlementStatus" NOT NULL DEFAULT 'PENDING', "settlementDate" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Settlement_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "ReconciliationRun" (
  "id" TEXT NOT NULL, "providerId" TEXT NOT NULL, "status" "ReconciliationStatus" NOT NULL DEFAULT 'QUEUED',
  "startedAt" TIMESTAMP(3), "completedAt" TIMESTAMP(3), "totalRecords" INTEGER NOT NULL DEFAULT 0,
  "matchedRecords" INTEGER NOT NULL DEFAULT 0, "exceptionCount" INTEGER NOT NULL DEFAULT 0, "summary" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ReconciliationRun_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "ReconciliationItem" (
  "id" TEXT NOT NULL, "runId" TEXT NOT NULL, "externalReference" TEXT, "internalReference" TEXT,
  "currency" VARCHAR(3) NOT NULL, "externalAmountMinor" BIGINT NOT NULL, "internalAmountMinor" BIGINT,
  "matched" BOOLEAN NOT NULL DEFAULT false, "exceptionCode" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "ReconciliationItem_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "PricingRule" (
  "id" TEXT NOT NULL, "merchantId" TEXT, "name" TEXT NOT NULL, "countryCode" VARCHAR(2), "currency" VARCHAR(3),
  "paymentMethod" TEXT, "fixedFeeMinor" BIGINT NOT NULL DEFAULT 0, "percentageBps" INTEGER NOT NULL DEFAULT 0,
  "active" BOOLEAN NOT NULL DEFAULT false, "effectiveFrom" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "effectiveUntil" TIMESTAMP(3), "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL, CONSTRAINT "PricingRule_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "RiskReview" (
  "id" TEXT NOT NULL, "paymentId" TEXT NOT NULL, "status" "RiskReviewStatus" NOT NULL DEFAULT 'OPEN',
  "score" INTEGER, "reasonCode" TEXT, "notes" TEXT, "reviewedByAdminId" TEXT, "reviewedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "RiskReview_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "Notification" (
  "id" TEXT NOT NULL, "userId" TEXT, "merchantId" TEXT, "type" VARCHAR(64) NOT NULL,
  "title" TEXT NOT NULL, "message" TEXT NOT NULL, "readAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "ProviderConfiguration" (
  "id" TEXT NOT NULL, "providerId" TEXT NOT NULL, "displayName" TEXT NOT NULL,
  "environment" "ApiKeyEnvironment" NOT NULL, "enabled" BOOLEAN NOT NULL DEFAULT false,
  "capabilities" JSONB, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL, CONSTRAINT "ProviderConfiguration_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "WebhookEndpoint" (
  "id" TEXT NOT NULL, "merchantId" TEXT NOT NULL, "url" TEXT NOT NULL, "secretHash" TEXT NOT NULL,
  "enabled" BOOLEAN NOT NULL DEFAULT true, "eventTypes" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "WebhookEndpoint_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "WebhookDelivery" (
  "id" TEXT NOT NULL, "endpointId" TEXT NOT NULL, "eventId" TEXT NOT NULL, "attempt" INTEGER NOT NULL DEFAULT 0,
  "responseCode" INTEGER, "status" VARCHAR(32) NOT NULL DEFAULT 'PENDING', "nextAttemptAt" TIMESTAMP(3),
  "deliveredAt" TIMESTAMP(3), "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL, CONSTRAINT "WebhookDelivery_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Customer_merchantId_externalId_key" ON "Customer"("merchantId", "externalId");
CREATE INDEX "Customer_merchantId_email_idx" ON "Customer"("merchantId", "email");
CREATE INDEX "Customer_merchantId_createdAt_idx" ON "Customer"("merchantId", "createdAt");
CREATE UNIQUE INDEX "MerchantMember_merchantId_userId_key" ON "MerchantMember"("merchantId", "userId");
CREATE INDEX "MerchantMember_userId_role_idx" ON "MerchantMember"("userId", "role");
CREATE UNIQUE INDEX "Refund_merchantId_idempotencyKey_key" ON "Refund"("merchantId", "idempotencyKey");
CREATE INDEX "Refund_merchantId_status_createdAt_idx" ON "Refund"("merchantId", "status", "createdAt");
CREATE INDEX "Refund_paymentId_createdAt_idx" ON "Refund"("paymentId", "createdAt");
CREATE INDEX "Refund_providerRefundId_idx" ON "Refund"("providerRefundId");
CREATE UNIQUE INDEX "PaymentLink_tokenHash_key" ON "PaymentLink"("tokenHash");
CREATE INDEX "PaymentLink_merchantId_status_createdAt_idx" ON "PaymentLink"("merchantId", "status", "createdAt");
CREATE INDEX "PaymentLink_status_expiresAt_idx" ON "PaymentLink"("status", "expiresAt");
CREATE INDEX "CheckoutSession_paymentLinkId_idx" ON "CheckoutSession"("paymentLinkId");
CREATE UNIQUE INDEX "BillingInvoice_invoiceNumber_key" ON "BillingInvoice"("invoiceNumber");
CREATE INDEX "BillingInvoice_merchantId_status_createdAt_idx" ON "BillingInvoice"("merchantId", "status", "createdAt");
CREATE INDEX "BillingInvoice_status_dueAt_idx" ON "BillingInvoice"("status", "dueAt");
CREATE UNIQUE INDEX "Settlement_providerId_providerReference_key" ON "Settlement"("providerId", "providerReference");
CREATE INDEX "Settlement_providerId_status_createdAt_idx" ON "Settlement"("providerId", "status", "createdAt");
CREATE INDEX "Settlement_merchantId_settlementDate_idx" ON "Settlement"("merchantId", "settlementDate");
CREATE INDEX "ReconciliationRun_providerId_status_createdAt_idx" ON "ReconciliationRun"("providerId", "status", "createdAt");
CREATE INDEX "ReconciliationItem_runId_matched_idx" ON "ReconciliationItem"("runId", "matched");
CREATE INDEX "ReconciliationItem_externalReference_idx" ON "ReconciliationItem"("externalReference");
CREATE INDEX "PricingRule_active_effectiveFrom_effectiveUntil_idx" ON "PricingRule"("active", "effectiveFrom", "effectiveUntil");
CREATE INDEX "PricingRule_merchantId_currency_countryCode_idx" ON "PricingRule"("merchantId", "currency", "countryCode");
CREATE UNIQUE INDEX "RiskReview_paymentId_key" ON "RiskReview"("paymentId");
CREATE INDEX "RiskReview_status_createdAt_idx" ON "RiskReview"("status", "createdAt");
CREATE INDEX "RiskReview_reviewedByAdminId_reviewedAt_idx" ON "RiskReview"("reviewedByAdminId", "reviewedAt");
CREATE INDEX "Notification_userId_readAt_createdAt_idx" ON "Notification"("userId", "readAt", "createdAt");
CREATE INDEX "Notification_merchantId_createdAt_idx" ON "Notification"("merchantId", "createdAt");
CREATE UNIQUE INDEX "ProviderConfiguration_providerId_environment_key" ON "ProviderConfiguration"("providerId", "environment");
CREATE INDEX "ProviderConfiguration_enabled_environment_idx" ON "ProviderConfiguration"("enabled", "environment");
CREATE INDEX "WebhookEndpoint_merchantId_enabled_idx" ON "WebhookEndpoint"("merchantId", "enabled");
CREATE UNIQUE INDEX "WebhookDelivery_endpointId_eventId_key" ON "WebhookDelivery"("endpointId", "eventId");
CREATE INDEX "WebhookDelivery_status_nextAttemptAt_idx" ON "WebhookDelivery"("status", "nextAttemptAt");

ALTER TABLE "Customer" ADD CONSTRAINT "Customer_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "Merchant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "MerchantMember" ADD CONSTRAINT "MerchantMember_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "Merchant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "MerchantMember" ADD CONSTRAINT "MerchantMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Refund" ADD CONSTRAINT "Refund_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "Merchant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Refund" ADD CONSTRAINT "Refund_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "Payment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "PaymentLink" ADD CONSTRAINT "PaymentLink_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "Merchant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "CheckoutSession" ADD CONSTRAINT "CheckoutSession_paymentLinkId_fkey" FOREIGN KEY ("paymentLinkId") REFERENCES "PaymentLink"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "BillingInvoice" ADD CONSTRAINT "BillingInvoice_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "Merchant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Settlement" ADD CONSTRAINT "Settlement_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "Merchant"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ReconciliationItem" ADD CONSTRAINT "ReconciliationItem_runId_fkey" FOREIGN KEY ("runId") REFERENCES "ReconciliationRun"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PricingRule" ADD CONSTRAINT "PricingRule_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "Merchant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "RiskReview" ADD CONSTRAINT "RiskReview_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "Payment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "RiskReview" ADD CONSTRAINT "RiskReview_reviewedByAdminId_fkey" FOREIGN KEY ("reviewedByAdminId") REFERENCES "AdminUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "Merchant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "WebhookEndpoint" ADD CONSTRAINT "WebhookEndpoint_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "Merchant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "WebhookDelivery" ADD CONSTRAINT "WebhookDelivery_endpointId_fkey" FOREIGN KEY ("endpointId") REFERENCES "WebhookEndpoint"("id") ON DELETE CASCADE ON UPDATE CASCADE;
