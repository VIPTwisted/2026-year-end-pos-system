-- Add new Supply Chain + Commerce models (safe: IF NOT EXISTS)

CREATE TABLE IF NOT EXISTS "Voyage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "voyageNo" TEXT NOT NULL,
    "description" TEXT,
    "vendorNo" TEXT,
    "voyageStatus" TEXT NOT NULL DEFAULT 'open',
    "shipDate" DATETIME,
    "estimatedArrival" DATETIME,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "totalAmountLCY" REAL NOT NULL DEFAULT 0,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS "Voyage_voyageNo_key" ON "Voyage"("voyageNo");

CREATE TABLE IF NOT EXISTS "VoyageCostLine" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "voyageId" TEXT NOT NULL,
    "costType" TEXT NOT NULL DEFAULT 'freight',
    "description" TEXT,
    "amount" REAL NOT NULL DEFAULT 0,
    "allocationMethod" TEXT NOT NULL DEFAULT 'by_value',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "VoyageCostLine_voyageId_fkey" FOREIGN KEY ("voyageId") REFERENCES "Voyage" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "FreightReconciliation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "carrier" TEXT NOT NULL,
    "serviceCode" TEXT,
    "billOfLadingNo" TEXT,
    "invoiceAmount" REAL NOT NULL DEFAULT 0,
    "expectedAmount" REAL NOT NULL DEFAULT 0,
    "difference" REAL NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'open',
    "glEntryCreated" BOOLEAN NOT NULL DEFAULT false,
    "glEntryRef" TEXT,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "ProductLifecycle" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "itemNo" TEXT NOT NULL,
    "description" TEXT,
    "lifecyclePhase" TEXT NOT NULL DEFAULT 'introduction',
    "effectiveDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "CatchWeightItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "itemNo" TEXT NOT NULL,
    "description" TEXT,
    "nominalWeight" REAL NOT NULL DEFAULT 0,
    "actualWeight" REAL NOT NULL DEFAULT 0,
    "qty" REAL NOT NULL DEFAULT 0,
    "variancePct" REAL NOT NULL DEFAULT 0,
    "unit" TEXT NOT NULL DEFAULT 'kg',
    "lotNo" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "HazmatItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "itemNo" TEXT NOT NULL,
    "description" TEXT,
    "unNo" TEXT,
    "hazardClass" TEXT,
    "packingGroup" TEXT,
    "flashPoint" REAL,
    "properShippingName" TEXT,
    "regulatoryBody" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "PriceSimulation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "simulationNo" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "priceList" TEXT,
    "dateFrom" DATETIME,
    "dateTo" DATETIME,
    "simulationType" TEXT NOT NULL DEFAULT 'what_if',
    "totalImpact" REAL NOT NULL DEFAULT 0,
    "linesJson" TEXT,
    "activatedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS "PriceSimulation_simulationNo_key" ON "PriceSimulation"("simulationNo");

CREATE TABLE IF NOT EXISTS "SubscriptionOrder" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "orderNo" TEXT NOT NULL,
    "customerId" TEXT,
    "itemId" TEXT,
    "itemName" TEXT,
    "frequency" TEXT NOT NULL DEFAULT 'monthly',
    "nextOrderDate" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'active',
    "qty" REAL NOT NULL DEFAULT 1,
    "unitPrice" REAL NOT NULL DEFAULT 0,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SubscriptionOrder_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "SubscriptionOrder_orderNo_key" ON "SubscriptionOrder"("orderNo");
