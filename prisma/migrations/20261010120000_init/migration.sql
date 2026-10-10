-- Initial DonexisPay schema. Generated/maintained alongside prisma/schema.prisma.
CREATE TYPE "MerchantStatus" AS ENUM ('PENDING', 'UNDER_REVIEW', 'ACTIVE', 'RESTRICTED', 'SUSPENDED', 'CLOSED');
CREATE TYPE "ApiKeyEnvironment" AS ENUM ('TEST', 'LIVE');
CREATE TYPE "CheckoutStatus" AS ENUM ('OPEN', 'PROCESSING', 'COMPLETED', 'CANCELED', 'EXPIRED');
CREATE TYPE "PaymentStatus" AS ENUM ('CREATED', 'REQUIRES_ACTION', 'PROCESSING', 'SUCCEEDED', 'FAILED', 'CANCELED', 'EXPIRED', 'REQUIRES_REVIEW');
CREATE TYPE "PaymentAttemptStatus" AS ENUM ('CREATED', 'SUBMITTED', 'PROCESSING', 'SUCCEEDED', 'FAILED', 'UNKNOWN');
CREATE TYPE "ProviderEventStatus" AS ENUM ('RECEIVED', 'PROCESSING', 'PROCESSED', 'FAILED', 'IGNORED');

CREATE TABLE "Merchant" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "status" "MerchantStatus" NOT NULL DEFAULT 'PENDING',
  "countryCode" VARCHAR(2),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Merchant_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ApiKey" (
  "id" TEXT NOT NULL,
  "merchantId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "keyPrefix" TEXT NOT NULL,
  "secretHash" TEXT NOT NULL,
  "environment" "ApiKeyEnvironment" NOT NULL,
  "scopes" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  "lastUsedAt" TIMESTAMP(3),
  "expiresAt" TIMESTAMP(3),
  "revokedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ApiKey_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "CheckoutSession" (
  "id" TEXT NOT NULL,
  "merchantId" TEXT NOT NULL,
  "orderReference" TEXT NOT NULL,
  "amountMinor" BIGINT NOT NULL,
  "currency" VARCHAR(3) NOT NULL,
  "description" TEXT,
  "checkoutTokenHash" TEXT NOT NULL,
  "status" "CheckoutStatus" NOT NULL DEFAULT 'OPEN',
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "successUrl" TEXT,
  "cancelUrl" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "CheckoutSession_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Payment" (
  "id" TEXT NOT NULL,
  "merchantId" TEXT NOT NULL,
  "checkoutSessionId" TEXT,
  "amountMinor" BIGINT NOT NULL,
  "currency" VARCHAR(3) NOT NULL,
  "status" "PaymentStatus" NOT NULL DEFAULT 'CREATED',
  "providerId" TEXT,
  "providerPaymentId" TEXT,
  "failureCode" TEXT,
  "failureMessage" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "completedAt" TIMESTAMP(3),
  CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "PaymentAttempt" (
  "id" TEXT NOT NULL,
  "paymentId" TEXT NOT NULL,
  "providerId" TEXT NOT NULL,
  "providerPaymentId" TEXT,
  "status" "PaymentAttemptStatus" NOT NULL DEFAULT 'CREATED',
  "idempotencyKey" TEXT NOT NULL,
  "requestReference" TEXT,
  "errorCode" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "PaymentAttempt_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ProviderEvent" (
  "id" TEXT NOT NULL,
  "providerId" TEXT NOT NULL,
  "providerEventId" TEXT NOT NULL,
  "eventType" TEXT NOT NULL,
  "status" "ProviderEventStatus" NOT NULL DEFAULT 'RECEIVED',
  "payload" JSONB NOT NULL,
  "receivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "processedAt" TIMESTAMP(3),
  "lastError" TEXT,
  CONSTRAINT "ProviderEvent_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "IdempotencyRecord" (
  "id" TEXT NOT NULL,
  "merchantId" TEXT NOT NULL,
  "operation" TEXT NOT NULL,
  "key" TEXT NOT NULL,
  "requestHash" TEXT NOT NULL,
  "resourceId" TEXT,
  "responseCode" INTEGER,
  "responsePayload" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "expiresAt" TIMESTAMP(3),
  CONSTRAINT "IdempotencyRecord_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AuditLog" (
  "id" TEXT NOT NULL,
  "actorType" TEXT NOT NULL,
  "actorId" TEXT,
  "action" TEXT NOT NULL,
  "targetType" TEXT NOT NULL,
  "targetId" TEXT,
  "outcome" TEXT NOT NULL,
  "requestId" TEXT,
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Merchant_slug_key" ON "Merchant"("slug");
CREATE INDEX "Merchant_status_createdAt_idx" ON "Merchant"("status", "createdAt");
CREATE UNIQUE INDEX "ApiKey_keyPrefix_key" ON "ApiKey"("keyPrefix");
CREATE INDEX "ApiKey_merchantId_revokedAt_idx" ON "ApiKey"("merchantId", "revokedAt");
CREATE INDEX "ApiKey_expiresAt_idx" ON "ApiKey"("expiresAt");
CREATE UNIQUE INDEX "CheckoutSession_checkoutTokenHash_key" ON "CheckoutSession"("checkoutTokenHash");
CREATE UNIQUE INDEX "CheckoutSession_merchantId_orderReference_key" ON "CheckoutSession"("merchantId", "orderReference");
CREATE INDEX "CheckoutSession_merchantId_status_createdAt_idx" ON "CheckoutSession"("merchantId", "status", "createdAt");
CREATE INDEX "CheckoutSession_status_expiresAt_idx" ON "CheckoutSession"("status", "expiresAt");
CREATE INDEX "Payment_merchantId_status_createdAt_idx" ON "Payment"("merchantId", "status", "createdAt");
CREATE INDEX "Payment_providerId_providerPaymentId_idx" ON "Payment"("providerId", "providerPaymentId");
CREATE INDEX "Payment_checkoutSessionId_idx" ON "Payment"("checkoutSessionId");
CREATE UNIQUE INDEX "PaymentAttempt_providerId_idempotencyKey_key" ON "PaymentAttempt"("providerId", "idempotencyKey");
CREATE INDEX "PaymentAttempt_paymentId_createdAt_idx" ON "PaymentAttempt"("paymentId", "createdAt");
CREATE INDEX "PaymentAttempt_providerId_providerPaymentId_idx" ON "PaymentAttempt"("providerId", "providerPaymentId");
CREATE UNIQUE INDEX "ProviderEvent_providerId_providerEventId_key" ON "ProviderEvent"("providerId", "providerEventId");
CREATE INDEX "ProviderEvent_status_receivedAt_idx" ON "ProviderEvent"("status", "receivedAt");
CREATE UNIQUE INDEX "IdempotencyRecord_merchantId_operation_key_key" ON "IdempotencyRecord"("merchantId", "operation", "key");
CREATE INDEX "IdempotencyRecord_expiresAt_idx" ON "IdempotencyRecord"("expiresAt");
CREATE INDEX "AuditLog_targetType_targetId_createdAt_idx" ON "AuditLog"("targetType", "targetId", "createdAt");
CREATE INDEX "AuditLog_actorType_actorId_createdAt_idx" ON "AuditLog"("actorType", "actorId", "createdAt");
CREATE INDEX "AuditLog_action_createdAt_idx" ON "AuditLog"("action", "createdAt");

ALTER TABLE "ApiKey" ADD CONSTRAINT "ApiKey_merchantId_fkey"
  FOREIGN KEY ("merchantId") REFERENCES "Merchant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "CheckoutSession" ADD CONSTRAINT "CheckoutSession_merchantId_fkey"
  FOREIGN KEY ("merchantId") REFERENCES "Merchant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_merchantId_fkey"
  FOREIGN KEY ("merchantId") REFERENCES "Merchant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_checkoutSessionId_fkey"
  FOREIGN KEY ("checkoutSessionId") REFERENCES "CheckoutSession"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "PaymentAttempt" ADD CONSTRAINT "PaymentAttempt_paymentId_fkey"
  FOREIGN KEY ("paymentId") REFERENCES "Payment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "IdempotencyRecord" ADD CONSTRAINT "IdempotencyRecord_merchantId_fkey"
  FOREIGN KEY ("merchantId") REFERENCES "Merchant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
