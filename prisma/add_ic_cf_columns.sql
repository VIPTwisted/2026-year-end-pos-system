-- Add columns to stub IntercompanyPartner, IntercompanyTransaction, CashFlowForecast, CashFlowManualLine
-- Use ALTER TABLE ADD COLUMN with IF NOT EXISTS is not supported in older SQLite
-- We try each independently; failures on existing columns are OK

ALTER TABLE "IntercompanyPartner" ADD COLUMN "partnerCode" TEXT;
ALTER TABLE "IntercompanyPartner" ADD COLUMN "partnerName" TEXT;
ALTER TABLE "IntercompanyPartner" ADD COLUMN "partnerType" TEXT NOT NULL DEFAULT 'Company';
ALTER TABLE "IntercompanyPartner" ADD COLUMN "inboxType" TEXT NOT NULL DEFAULT 'Database';
ALTER TABLE "IntercompanyPartner" ADD COLUMN "inboxDetails" TEXT;
ALTER TABLE "IntercompanyPartner" ADD COLUMN "outboxType" TEXT NOT NULL DEFAULT 'Database';
ALTER TABLE "IntercompanyPartner" ADD COLUMN "autoAcceptTxns" BOOLEAN NOT NULL DEFAULT 0;
ALTER TABLE "IntercompanyPartner" ADD COLUMN "glAccountNo" TEXT;
ALTER TABLE "IntercompanyPartner" ADD COLUMN "currency" TEXT NOT NULL DEFAULT 'USD';
ALTER TABLE "IntercompanyPartner" ADD COLUMN "isActive" BOOLEAN NOT NULL DEFAULT 1;
ALTER TABLE "IntercompanyPartner" ADD COLUMN "notes" TEXT;

ALTER TABLE "IntercompanyTransaction" ADD COLUMN "transactionNo" TEXT;
ALTER TABLE "IntercompanyTransaction" ADD COLUMN "partnerId" TEXT;
ALTER TABLE "IntercompanyTransaction" ADD COLUMN "direction" TEXT NOT NULL DEFAULT 'sending';
ALTER TABLE "IntercompanyTransaction" ADD COLUMN "type" TEXT NOT NULL DEFAULT 'invoice';
ALTER TABLE "IntercompanyTransaction" ADD COLUMN "documentNo" TEXT;
ALTER TABLE "IntercompanyTransaction" ADD COLUMN "documentType" TEXT;
ALTER TABLE "IntercompanyTransaction" ADD COLUMN "postingDate" DATETIME;
ALTER TABLE "IntercompanyTransaction" ADD COLUMN "amount" REAL NOT NULL DEFAULT 0;
ALTER TABLE "IntercompanyTransaction" ADD COLUMN "currency" TEXT NOT NULL DEFAULT 'USD';
ALTER TABLE "IntercompanyTransaction" ADD COLUMN "amountInBase" REAL NOT NULL DEFAULT 0;
ALTER TABLE "IntercompanyTransaction" ADD COLUMN "glAccountNo" TEXT;
ALTER TABLE "IntercompanyTransaction" ADD COLUMN "description" TEXT;
ALTER TABLE "IntercompanyTransaction" ADD COLUMN "status" TEXT NOT NULL DEFAULT 'pending';
ALTER TABLE "IntercompanyTransaction" ADD COLUMN "isEliminated" BOOLEAN NOT NULL DEFAULT 0;
ALTER TABLE "IntercompanyTransaction" ADD COLUMN "eliminatedAt" DATETIME;
ALTER TABLE "IntercompanyTransaction" ADD COLUMN "notes" TEXT;

ALTER TABLE "CashFlowForecast" ADD COLUMN "name" TEXT;
ALTER TABLE "CashFlowForecast" ADD COLUMN "description" TEXT;
ALTER TABLE "CashFlowForecast" ADD COLUMN "forecastDate" DATETIME;
ALTER TABLE "CashFlowForecast" ADD COLUMN "includeAR" BOOLEAN NOT NULL DEFAULT 1;
ALTER TABLE "CashFlowForecast" ADD COLUMN "includeAP" BOOLEAN NOT NULL DEFAULT 1;
ALTER TABLE "CashFlowForecast" ADD COLUMN "includeSalesOrders" BOOLEAN NOT NULL DEFAULT 1;
ALTER TABLE "CashFlowForecast" ADD COLUMN "includePOs" BOOLEAN NOT NULL DEFAULT 1;
ALTER TABLE "CashFlowForecast" ADD COLUMN "includePayroll" BOOLEAN NOT NULL DEFAULT 0;

ALTER TABLE "CashFlowManualLine" ADD COLUMN "forecastId" TEXT;
ALTER TABLE "CashFlowManualLine" ADD COLUMN "description" TEXT;
ALTER TABLE "CashFlowManualLine" ADD COLUMN "amount" REAL NOT NULL DEFAULT 0;
ALTER TABLE "CashFlowManualLine" ADD COLUMN "expectedDate" DATETIME;
ALTER TABLE "CashFlowManualLine" ADD COLUMN "category" TEXT NOT NULL DEFAULT 'other';
ALTER TABLE "CashFlowManualLine" ADD COLUMN "notes" TEXT;
