-- CreateTable
CREATE TABLE "GlEntry" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "entryNo" INTEGER NOT NULL DEFAULT 0,
    "postingDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "documentType" TEXT,
    "documentNo" TEXT,
    "accountId" TEXT,
    "accountNo" TEXT,
    "accountName" TEXT,
    "description" TEXT,
    "debitAmount" REAL NOT NULL DEFAULT 0,
    "creditAmount" REAL NOT NULL DEFAULT 0,
    "amount" REAL NOT NULL DEFAULT 0,
    "vatAmount" REAL NOT NULL DEFAULT 0,
    "sourceCode" TEXT,
    "reasonCode" TEXT,
    "userId" TEXT,
    "journalId" TEXT,
    "fiscalYear" TEXT,
    "periodNo" INTEGER,
    "open" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "WarehousePick" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "pickNo" TEXT NOT NULL,
    "storeId" TEXT,
    "locationCode" TEXT,
    "assignedUserId" TEXT,
    "activityType" TEXT NOT NULL DEFAULT 'Pick',
    "sourceType" TEXT,
    "sourceId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'open',
    "completedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "WarehousePick_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "WarehousePickLine" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "pickId" TEXT NOT NULL,
    "lineNo" INTEGER NOT NULL DEFAULT 0,
    "actionType" TEXT NOT NULL DEFAULT 'Take',
    "productId" TEXT,
    "description" TEXT,
    "unitOfMeasure" TEXT NOT NULL DEFAULT 'EACH',
    "quantity" REAL NOT NULL DEFAULT 0,
    "qtyHandled" REAL NOT NULL DEFAULT 0,
    "fromZoneCode" TEXT,
    "fromBinCode" TEXT,
    "toZoneCode" TEXT,
    "toBinCode" TEXT,
    "lotNo" TEXT,
    "serialNo" TEXT,
    "isHandled" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "WarehousePickLine_pickId_fkey" FOREIGN KEY ("pickId") REFERENCES "WarehousePick" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "WarehousePickLine_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "WarehousePutAway" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "putAwayNo" TEXT NOT NULL,
    "storeId" TEXT,
    "locationCode" TEXT,
    "assignedUserId" TEXT,
    "sourceType" TEXT,
    "sourceId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'open',
    "completedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "WarehousePutAway_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "WarehousePutAwayLine" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "putAwayId" TEXT NOT NULL,
    "lineNo" INTEGER NOT NULL DEFAULT 0,
    "actionType" TEXT NOT NULL DEFAULT 'Take',
    "productId" TEXT,
    "description" TEXT,
    "unitOfMeasure" TEXT NOT NULL DEFAULT 'EACH',
    "quantity" REAL NOT NULL DEFAULT 0,
    "qtyHandled" REAL NOT NULL DEFAULT 0,
    "fromZoneCode" TEXT,
    "fromBinCode" TEXT,
    "toZoneCode" TEXT,
    "toBinCode" TEXT,
    "lotNo" TEXT,
    "serialNo" TEXT,
    "isHandled" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "WarehousePutAwayLine_putAwayId_fkey" FOREIGN KEY ("putAwayId") REFERENCES "WarehousePutAway" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "WarehousePutAwayLine_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "WarehouseMovement" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "movementNo" TEXT NOT NULL,
    "storeId" TEXT,
    "locationCode" TEXT,
    "assignedUserId" TEXT,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'open',
    "completedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "WarehouseMovement_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "WarehouseMovementLine" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "movementId" TEXT NOT NULL,
    "lineNo" INTEGER NOT NULL DEFAULT 0,
    "actionType" TEXT NOT NULL DEFAULT 'Take',
    "productId" TEXT,
    "description" TEXT,
    "unitOfMeasure" TEXT NOT NULL DEFAULT 'EACH',
    "quantity" REAL NOT NULL DEFAULT 0,
    "qtyHandled" REAL NOT NULL DEFAULT 0,
    "fromZoneCode" TEXT,
    "fromBinCode" TEXT,
    "toZoneCode" TEXT,
    "toBinCode" TEXT,
    "lotNo" TEXT,
    "serialNo" TEXT,
    "isHandled" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "WarehouseMovementLine_movementId_fkey" FOREIGN KEY ("movementId") REFERENCES "WarehouseMovement" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "WarehouseMovementLine_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "WarehouseInternalPick" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "internalPickNo" TEXT NOT NULL,
    "storeId" TEXT,
    "locationCode" TEXT,
    "assignedUserId" TEXT,
    "toZoneCode" TEXT,
    "toBinCode" TEXT,
    "status" TEXT NOT NULL DEFAULT 'open',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "WarehouseInternalPick_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "WarehouseInternalPickLine" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "internalPickId" TEXT NOT NULL,
    "lineNo" INTEGER NOT NULL DEFAULT 0,
    "productId" TEXT,
    "description" TEXT,
    "unitOfMeasure" TEXT NOT NULL DEFAULT 'EACH',
    "quantity" REAL NOT NULL DEFAULT 0,
    "qtyToHandle" REAL NOT NULL DEFAULT 0,
    "fromZoneCode" TEXT,
    "fromBinCode" TEXT,
    "toZoneCode" TEXT,
    "toBinCode" TEXT,
    "lotNo" TEXT,
    "serialNo" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "WarehouseInternalPickLine_internalPickId_fkey" FOREIGN KEY ("internalPickId") REFERENCES "WarehouseInternalPick" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "WarehouseInternalPickLine_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CapacityLedgerEntry" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "entryNo" INTEGER NOT NULL DEFAULT 0,
    "postingDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "type" TEXT NOT NULL DEFAULT 'work_center',
    "workCenterId" TEXT,
    "machineCenterId" TEXT,
    "operationNo" TEXT NOT NULL DEFAULT '',
    "description" TEXT NOT NULL DEFAULT '',
    "setupTime" REAL NOT NULL DEFAULT 0,
    "runTime" REAL NOT NULL DEFAULT 0,
    "stopTime" REAL NOT NULL DEFAULT 0,
    "capacityType" TEXT NOT NULL DEFAULT 'direct',
    "outputQuantity" REAL NOT NULL DEFAULT 0,
    "scrapQuantity" REAL NOT NULL DEFAULT 0,
    "unitCost" REAL NOT NULL DEFAULT 0,
    "directCost" REAL NOT NULL DEFAULT 0,
    "productionOrderId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "CapacityLedgerEntry_workCenterId_fkey" FOREIGN KEY ("workCenterId") REFERENCES "WorkCenter" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SubscriptionOrder" (
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
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "SubscriptionOrder_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "IvrFlowNode" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "flowId" TEXT NOT NULL,
    "stepNo" INTEGER NOT NULL,
    "nodeType" TEXT NOT NULL DEFAULT 'Message',
    "configJson" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "AgentScriptStep" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "scriptId" TEXT NOT NULL,
    "stepNo" INTEGER NOT NULL,
    "stepType" TEXT NOT NULL DEFAULT 'Greeting',
    "scriptText" TEXT,
    "suggestedResponse" TEXT,
    "nextStepLogic" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "CallQueue" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "maxLength" INTEGER NOT NULL DEFAULT 20,
    "waitMusic" TEXT,
    "overflowQueueId" TEXT,
    "timeoutSeconds" INTEGER NOT NULL DEFAULT 300,
    "priorityRules" TEXT,
    "agentsAssigned" INTEGER NOT NULL DEFAULT 0,
    "avgWaitSeconds" INTEGER NOT NULL DEFAULT 0,
    "overflowAction" TEXT NOT NULL DEFAULT 'voicemail',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_AccountingPeriod" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "startingDate" DATETIME NOT NULL,
    "name" TEXT NOT NULL,
    "newFiscalYear" BOOLEAN NOT NULL DEFAULT false,
    "closed" BOOLEAN NOT NULL DEFAULT false,
    "dateLocked" BOOLEAN NOT NULL DEFAULT false,
    "inventoryClosed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_AccountingPeriod" ("closed", "createdAt", "dateLocked", "id", "inventoryClosed", "name", "newFiscalYear", "startingDate", "updatedAt") SELECT "closed", "createdAt", "dateLocked", "id", "inventoryClosed", "name", "newFiscalYear", "startingDate", "updatedAt" FROM "AccountingPeriod";
DROP TABLE "AccountingPeriod";
ALTER TABLE "new_AccountingPeriod" RENAME TO "AccountingPeriod";
CREATE UNIQUE INDEX "AccountingPeriod_startingDate_key" ON "AccountingPeriod"("startingDate");
CREATE TABLE "new_BankReconciliation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "bankAccountId" TEXT NOT NULL,
    "statementDate" DATETIME NOT NULL,
    "statementNo" TEXT,
    "openingBalance" REAL NOT NULL DEFAULT 0,
    "closingBalance" REAL NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'open',
    "reconciledAt" DATETIME,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "BankReconciliation_bankAccountId_fkey" FOREIGN KEY ("bankAccountId") REFERENCES "BankAccount" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_BankReconciliation" ("bankAccountId", "closingBalance", "createdAt", "id", "notes", "openingBalance", "reconciledAt", "statementDate", "statementNo", "status", "updatedAt") SELECT "bankAccountId", "closingBalance", "createdAt", "id", "notes", "openingBalance", "reconciledAt", "statementDate", "statementNo", "status", "updatedAt" FROM "BankReconciliation";
DROP TABLE "BankReconciliation";
ALTER TABLE "new_BankReconciliation" RENAME TO "BankReconciliation";
CREATE TABLE "new_BankTransaction" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "bankAccountId" TEXT NOT NULL,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "description" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "runningBalance" REAL NOT NULL DEFAULT 0,
    "reference" TEXT,
    "category" TEXT,
    "isReconciled" BOOLEAN NOT NULL DEFAULT false,
    "reconciledAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "BankTransaction_bankAccountId_fkey" FOREIGN KEY ("bankAccountId") REFERENCES "BankAccount" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_BankTransaction" ("amount", "bankAccountId", "category", "createdAt", "date", "description", "id", "isReconciled", "reconciledAt", "reference", "runningBalance", "updatedAt") SELECT "amount", "bankAccountId", "category", "createdAt", "date", "description", "id", "isReconciled", "reconciledAt", "reference", "runningBalance", "updatedAt" FROM "BankTransaction";
DROP TABLE "BankTransaction";
ALTER TABLE "new_BankTransaction" RENAME TO "BankTransaction";
CREATE TABLE "new_CostType" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "no" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'cost_type',
    "glAccountRange" TEXT,
    "costCenterId" TEXT,
    "blocked" BOOLEAN NOT NULL DEFAULT false,
    "indentation" INTEGER NOT NULL DEFAULT 0,
    "totalingRange" TEXT,
    "netChange" REAL NOT NULL DEFAULT 0,
    "balance" REAL NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_CostType" ("balance", "blocked", "costCenterId", "createdAt", "glAccountRange", "id", "indentation", "name", "netChange", "no", "totalingRange", "type", "updatedAt") SELECT "balance", "blocked", "costCenterId", "createdAt", "glAccountRange", "id", "indentation", "name", "netChange", "no", "totalingRange", "type", "updatedAt" FROM "CostType";
DROP TABLE "CostType";
ALTER TABLE "new_CostType" RENAME TO "CostType";
CREATE UNIQUE INDEX "CostType_no_key" ON "CostType"("no");
CREATE TABLE "new_InventoryAdjustment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "journalTemplate" TEXT NOT NULL DEFAULT 'ITEM',
    "journalBatch" TEXT NOT NULL DEFAULT 'DEFAULT',
    "lineNo" INTEGER NOT NULL DEFAULT 1,
    "entryType" TEXT NOT NULL DEFAULT 'Positive Adjmt.',
    "productId" TEXT,
    "description" TEXT,
    "locationCode" TEXT,
    "quantity" REAL NOT NULL DEFAULT 0,
    "unitCost" REAL NOT NULL DEFAULT 0,
    "postingDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "documentNo" TEXT,
    "storeId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'open',
    "postedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_InventoryAdjustment" ("createdAt", "description", "documentNo", "entryType", "id", "journalBatch", "journalTemplate", "lineNo", "locationCode", "postedAt", "postingDate", "productId", "quantity", "status", "storeId", "unitCost", "updatedAt") SELECT "createdAt", "description", "documentNo", "entryType", "id", "journalBatch", "journalTemplate", "lineNo", "locationCode", "postedAt", "postingDate", "productId", "quantity", "status", "storeId", "unitCost", "updatedAt" FROM "InventoryAdjustment";
DROP TABLE "InventoryAdjustment";
ALTER TABLE "new_InventoryAdjustment" RENAME TO "InventoryAdjustment";
CREATE TABLE "new_ItemCategory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "description" TEXT,
    "parentId" TEXT,
    "defCostingMethod" TEXT DEFAULT 'FIFO',
    "defGenProdPostingGroup" TEXT,
    "indentationLevel" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ItemCategory_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "ItemCategory" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_ItemCategory" ("code", "createdAt", "defCostingMethod", "defGenProdPostingGroup", "description", "id", "indentationLevel", "isActive", "parentId", "updatedAt") SELECT "code", "createdAt", "defCostingMethod", "defGenProdPostingGroup", "description", "id", "indentationLevel", "isActive", "parentId", "updatedAt" FROM "ItemCategory";
DROP TABLE "ItemCategory";
ALTER TABLE "new_ItemCategory" RENAME TO "ItemCategory";
CREATE UNIQUE INDEX "ItemCategory_code_key" ON "ItemCategory"("code");
CREATE TABLE "new_ItemTrackingEntry" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "productId" TEXT,
    "entryType" TEXT NOT NULL DEFAULT 'lot',
    "lotNo" TEXT,
    "serialNo" TEXT,
    "quantity" REAL NOT NULL DEFAULT 0,
    "remainingQty" REAL NOT NULL DEFAULT 0,
    "description" TEXT,
    "expirationDate" DATETIME,
    "locationCode" TEXT,
    "storeId" TEXT,
    "openedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_ItemTrackingEntry" ("createdAt", "description", "entryType", "expirationDate", "id", "locationCode", "lotNo", "openedAt", "productId", "quantity", "remainingQty", "serialNo", "storeId", "updatedAt") SELECT "createdAt", "description", "entryType", "expirationDate", "id", "locationCode", "lotNo", "openedAt", "productId", "quantity", "remainingQty", "serialNo", "storeId", "updatedAt" FROM "ItemTrackingEntry";
DROP TABLE "ItemTrackingEntry";
ALTER TABLE "new_ItemTrackingEntry" RENAME TO "ItemTrackingEntry";
CREATE TABLE "new_PhysicalInventoryJournal" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "journalBatch" TEXT NOT NULL DEFAULT 'PHYS-INV',
    "postingDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "documentNo" TEXT,
    "productId" TEXT,
    "description" TEXT,
    "locationCode" TEXT,
    "qtyCalculated" REAL NOT NULL DEFAULT 0,
    "qtyPhysInventory" REAL NOT NULL DEFAULT 0,
    "unitCost" REAL NOT NULL DEFAULT 0,
    "storeId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'open',
    "postedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_PhysicalInventoryJournal" ("createdAt", "description", "documentNo", "id", "journalBatch", "locationCode", "postedAt", "postingDate", "productId", "qtyCalculated", "qtyPhysInventory", "status", "storeId", "unitCost", "updatedAt") SELECT "createdAt", "description", "documentNo", "id", "journalBatch", "locationCode", "postedAt", "postingDate", "productId", "qtyCalculated", "qtyPhysInventory", "status", "storeId", "unitCost", "updatedAt" FROM "PhysicalInventoryJournal";
DROP TABLE "PhysicalInventoryJournal";
ALTER TABLE "new_PhysicalInventoryJournal" RENAME TO "PhysicalInventoryJournal";
CREATE TABLE "new_PriceList" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "status" TEXT NOT NULL DEFAULT 'Draft',
    "startDate" DATETIME,
    "endDate" DATETIME,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_PriceList" ("code", "createdAt", "currency", "description", "endDate", "id", "isActive", "name", "startDate", "status", "updatedAt") SELECT "code", "createdAt", "currency", "description", "endDate", "id", "isActive", "name", "startDate", "status", "updatedAt" FROM "PriceList";
DROP TABLE "PriceList";
ALTER TABLE "new_PriceList" RENAME TO "PriceList";
CREATE UNIQUE INDEX "PriceList_code_key" ON "PriceList"("code");
CREATE TABLE "new_SalesInvoice" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "invoiceNumber" TEXT NOT NULL,
    "sellToCustomerId" TEXT,
    "sellToCustomerName" TEXT,
    "externalDocNo" TEXT,
    "salespersonCode" TEXT,
    "orderId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'Open',
    "postingDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dueDate" DATETIME,
    "subtotal" REAL NOT NULL DEFAULT 0,
    "discountAmount" REAL NOT NULL DEFAULT 0,
    "taxAmount" REAL NOT NULL DEFAULT 0,
    "totalAmount" REAL NOT NULL DEFAULT 0,
    "remainingAmount" REAL NOT NULL DEFAULT 0,
    "paidAmount" REAL NOT NULL DEFAULT 0,
    "accountName" TEXT,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "SalesInvoice_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "SalesOrder" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "SalesInvoice_sellToCustomerId_fkey" FOREIGN KEY ("sellToCustomerId") REFERENCES "Customer" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_SalesInvoice" ("accountName", "createdAt", "discountAmount", "dueDate", "externalDocNo", "id", "invoiceNumber", "notes", "orderId", "paidAmount", "postingDate", "remainingAmount", "salespersonCode", "sellToCustomerId", "sellToCustomerName", "status", "subtotal", "taxAmount", "totalAmount", "updatedAt") SELECT "accountName", "createdAt", "discountAmount", "dueDate", "externalDocNo", "id", "invoiceNumber", "notes", "orderId", "paidAmount", "postingDate", "remainingAmount", "salespersonCode", "sellToCustomerId", "sellToCustomerName", "status", "subtotal", "taxAmount", "totalAmount", "updatedAt" FROM "SalesInvoice";
DROP TABLE "SalesInvoice";
ALTER TABLE "new_SalesInvoice" RENAME TO "SalesInvoice";
CREATE UNIQUE INDEX "SalesInvoice_invoiceNumber_key" ON "SalesInvoice"("invoiceNumber");
CREATE TABLE "new_SalesInvoiceItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "invoiceId" TEXT NOT NULL,
    "lineType" TEXT NOT NULL DEFAULT 'Item',
    "itemNo" TEXT,
    "description" TEXT NOT NULL DEFAULT '',
    "quantity" REAL NOT NULL DEFAULT 1,
    "unitPrice" REAL NOT NULL DEFAULT 0,
    "discountPct" REAL NOT NULL DEFAULT 0,
    "lineTotal" REAL NOT NULL DEFAULT 0,
    "productName" TEXT NOT NULL DEFAULT '',
    "pricePerUnit" REAL NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SalesInvoiceItem_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "SalesInvoice" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_SalesInvoiceItem" ("createdAt", "description", "discountPct", "id", "invoiceId", "itemNo", "lineTotal", "lineType", "pricePerUnit", "productName", "quantity", "unitPrice") SELECT "createdAt", "description", "discountPct", "id", "invoiceId", "itemNo", "lineTotal", "lineType", "pricePerUnit", "productName", "quantity", "unitPrice" FROM "SalesInvoiceItem";
DROP TABLE "SalesInvoiceItem";
ALTER TABLE "new_SalesInvoiceItem" RENAME TO "SalesInvoiceItem";
CREATE TABLE "new_SalesOrder" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "orderNumber" TEXT NOT NULL,
    "sellToCustomerId" TEXT,
    "sellToCustomerName" TEXT,
    "billToCustomerId" TEXT,
    "billToCustomerName" TEXT,
    "quoteId" TEXT,
    "externalDocNo" TEXT,
    "salespersonCode" TEXT,
    "status" TEXT NOT NULL DEFAULT 'Open',
    "orderDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "postingDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "shipToName" TEXT,
    "shipToAddress" TEXT,
    "shipToCity" TEXT,
    "shipToState" TEXT,
    "shipToZip" TEXT,
    "shippingAgentCode" TEXT,
    "subtotal" REAL NOT NULL DEFAULT 0,
    "discountAmount" REAL NOT NULL DEFAULT 0,
    "taxAmount" REAL NOT NULL DEFAULT 0,
    "totalAmount" REAL NOT NULL DEFAULT 0,
    "accountName" TEXT,
    "dueDate" DATETIME,
    "notes" TEXT,
    "ownerId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "SalesOrder_sellToCustomerId_fkey" FOREIGN KEY ("sellToCustomerId") REFERENCES "Customer" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_SalesOrder" ("accountName", "billToCustomerId", "billToCustomerName", "createdAt", "discountAmount", "dueDate", "externalDocNo", "id", "notes", "orderDate", "orderNumber", "ownerId", "postingDate", "quoteId", "salespersonCode", "sellToCustomerId", "sellToCustomerName", "shipToAddress", "shipToCity", "shipToName", "shipToState", "shipToZip", "shippingAgentCode", "status", "subtotal", "taxAmount", "totalAmount", "updatedAt") SELECT "accountName", "billToCustomerId", "billToCustomerName", "createdAt", "discountAmount", "dueDate", "externalDocNo", "id", "notes", "orderDate", "orderNumber", "ownerId", "postingDate", "quoteId", "salespersonCode", "sellToCustomerId", "sellToCustomerName", "shipToAddress", "shipToCity", "shipToName", "shipToState", "shipToZip", "shippingAgentCode", "status", "subtotal", "taxAmount", "totalAmount", "updatedAt" FROM "SalesOrder";
DROP TABLE "SalesOrder";
ALTER TABLE "new_SalesOrder" RENAME TO "SalesOrder";
CREATE UNIQUE INDEX "SalesOrder_orderNumber_key" ON "SalesOrder"("orderNumber");
CREATE TABLE "new_SalesOrderItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "orderId" TEXT NOT NULL,
    "lineType" TEXT NOT NULL DEFAULT 'Item',
    "itemNo" TEXT,
    "description" TEXT NOT NULL DEFAULT '',
    "quantity" REAL NOT NULL DEFAULT 1,
    "unitPrice" REAL NOT NULL DEFAULT 0,
    "discountPct" REAL NOT NULL DEFAULT 0,
    "lineTotal" REAL NOT NULL DEFAULT 0,
    "productName" TEXT NOT NULL DEFAULT '',
    "pricePerUnit" REAL NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SalesOrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "SalesOrder" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_SalesOrderItem" ("createdAt", "description", "discountPct", "id", "itemNo", "lineTotal", "lineType", "orderId", "pricePerUnit", "productName", "quantity", "unitPrice") SELECT "createdAt", "description", "discountPct", "id", "itemNo", "lineTotal", "lineType", "orderId", "pricePerUnit", "productName", "quantity", "unitPrice" FROM "SalesOrderItem";
DROP TABLE "SalesOrderItem";
ALTER TABLE "new_SalesOrderItem" RENAME TO "SalesOrderItem";
CREATE TABLE "new_SalesQuote" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "quoteNumber" TEXT NOT NULL,
    "sellToCustomerId" TEXT,
    "sellToCustomerName" TEXT,
    "billToCustomerId" TEXT,
    "billToCustomerName" TEXT,
    "externalDocNo" TEXT,
    "salespersonCode" TEXT,
    "customerId" TEXT,
    "storeId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'Open',
    "quoteDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "postingDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "validUntil" DATETIME,
    "shipToName" TEXT,
    "shipToAddress" TEXT,
    "shippingAgentCode" TEXT,
    "subtotal" REAL NOT NULL DEFAULT 0,
    "discountAmount" REAL NOT NULL DEFAULT 0,
    "taxAmount" REAL NOT NULL DEFAULT 0,
    "total" REAL NOT NULL DEFAULT 0,
    "notes" TEXT,
    "terms" TEXT,
    "convertedOrderId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "SalesQuote_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "SalesQuote_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_SalesQuote" ("billToCustomerId", "billToCustomerName", "convertedOrderId", "createdAt", "customerId", "discountAmount", "externalDocNo", "id", "notes", "postingDate", "quoteDate", "quoteNumber", "salespersonCode", "sellToCustomerName", "shipToAddress", "shipToName", "shippingAgentCode", "status", "storeId", "subtotal", "taxAmount", "terms", "total", "updatedAt", "validUntil") SELECT "billToCustomerId", "billToCustomerName", "convertedOrderId", "createdAt", "customerId", "discountAmount", "externalDocNo", "id", "notes", "postingDate", "quoteDate", "quoteNumber", "salespersonCode", "sellToCustomerName", "shipToAddress", "shipToName", "shippingAgentCode", "status", "storeId", "subtotal", "taxAmount", "terms", "total", "updatedAt", "validUntil" FROM "SalesQuote";
DROP TABLE "SalesQuote";
ALTER TABLE "new_SalesQuote" RENAME TO "SalesQuote";
CREATE UNIQUE INDEX "SalesQuote_quoteNumber_key" ON "SalesQuote"("quoteNumber");
CREATE TABLE "new_SalesQuoteLine" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "quoteId" TEXT NOT NULL,
    "productId" TEXT,
    "lineType" TEXT NOT NULL DEFAULT 'Item',
    "itemNo" TEXT,
    "productName" TEXT NOT NULL DEFAULT '',
    "description" TEXT,
    "quantity" REAL NOT NULL DEFAULT 1,
    "unitPrice" REAL NOT NULL DEFAULT 0,
    "discountPct" REAL NOT NULL DEFAULT 0,
    "lineTotal" REAL NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SalesQuoteLine_quoteId_fkey" FOREIGN KEY ("quoteId") REFERENCES "SalesQuote" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "SalesQuoteLine_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_SalesQuoteLine" ("createdAt", "description", "discountPct", "id", "itemNo", "lineTotal", "lineType", "productId", "productName", "quantity", "quoteId", "unitPrice") SELECT "createdAt", "description", "discountPct", "id", "itemNo", "lineTotal", "lineType", "productId", "productName", "quantity", "quoteId", "unitPrice" FROM "SalesQuoteLine";
DROP TABLE "SalesQuoteLine";
ALTER TABLE "new_SalesQuoteLine" RENAME TO "SalesQuoteLine";
CREATE TABLE "new_TransferOrder" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "orderNumber" TEXT NOT NULL,
    "transferNumber" TEXT,
    "fromStoreId" TEXT,
    "toStoreId" TEXT,
    "inTransitCode" TEXT,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "requestedDate" DATETIME,
    "shipmentDate" DATETIME,
    "receiptDate" DATETIME,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "TransferOrder_fromStoreId_fkey" FOREIGN KEY ("fromStoreId") REFERENCES "Store" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "TransferOrder_toStoreId_fkey" FOREIGN KEY ("toStoreId") REFERENCES "Store" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_TransferOrder" ("createdAt", "fromStoreId", "id", "inTransitCode", "notes", "orderNumber", "receiptDate", "requestedDate", "shipmentDate", "status", "toStoreId", "transferNumber", "updatedAt") SELECT "createdAt", "fromStoreId", "id", "inTransitCode", "notes", "orderNumber", "receiptDate", "requestedDate", "shipmentDate", "status", "toStoreId", "transferNumber", "updatedAt" FROM "TransferOrder";
DROP TABLE "TransferOrder";
ALTER TABLE "new_TransferOrder" RENAME TO "TransferOrder";
CREATE UNIQUE INDEX "TransferOrder_orderNumber_key" ON "TransferOrder"("orderNumber");
CREATE TABLE "new_UnitOfMeasure" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "description" TEXT,
    "internationalStandardCode" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_UnitOfMeasure" ("code", "createdAt", "description", "id", "internationalStandardCode", "updatedAt") SELECT "code", "createdAt", "description", "id", "internationalStandardCode", "updatedAt" FROM "UnitOfMeasure";
DROP TABLE "UnitOfMeasure";
ALTER TABLE "new_UnitOfMeasure" RENAME TO "UnitOfMeasure";
CREATE UNIQUE INDEX "UnitOfMeasure_code_key" ON "UnitOfMeasure"("code");
CREATE TABLE "new_WarehouseActivity" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "activityNo" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'put_away',
    "storeId" TEXT,
    "assignedUserId" TEXT,
    "locationCode" TEXT,
    "sourceType" TEXT,
    "sourceId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'open',
    "completedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "receiptId" TEXT,
    "shipmentId" TEXT,
    CONSTRAINT "WarehouseActivity_receiptId_fkey" FOREIGN KEY ("receiptId") REFERENCES "WarehouseReceipt" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "WarehouseActivity_shipmentId_fkey" FOREIGN KEY ("shipmentId") REFERENCES "WarehouseShipment" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_WarehouseActivity" ("createdAt", "id", "updatedAt") SELECT "createdAt", "id", "updatedAt" FROM "WarehouseActivity";
DROP TABLE "WarehouseActivity";
ALTER TABLE "new_WarehouseActivity" RENAME TO "WarehouseActivity";
CREATE UNIQUE INDEX "WarehouseActivity_activityNo_key" ON "WarehouseActivity"("activityNo");
CREATE TABLE "new_WarehouseActivityLine" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "activityId" TEXT NOT NULL,
    "lineNo" INTEGER NOT NULL DEFAULT 0,
    "actionType" TEXT NOT NULL DEFAULT 'take',
    "productId" TEXT,
    "variantCode" TEXT,
    "unitOfMeasure" TEXT NOT NULL DEFAULT 'EACH',
    "quantity" REAL NOT NULL DEFAULT 0,
    "qtyHandled" REAL NOT NULL DEFAULT 0,
    "fromBinId" TEXT,
    "toBinId" TEXT,
    "binId" TEXT,
    "zoneCode" TEXT,
    "lotNo" TEXT,
    "serialNo" TEXT,
    "isHandled" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "WarehouseActivityLine_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "WarehouseActivity" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "WarehouseActivityLine_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_WarehouseActivityLine" ("createdAt", "id", "updatedAt") SELECT "createdAt", "id", "updatedAt" FROM "WarehouseActivityLine";
DROP TABLE "WarehouseActivityLine";
ALTER TABLE "new_WarehouseActivityLine" RENAME TO "WarehouseActivityLine";
CREATE TABLE "new_WarehouseBin" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "storeId" TEXT NOT NULL,
    "zoneId" TEXT,
    "code" TEXT NOT NULL,
    "description" TEXT,
    "binType" TEXT NOT NULL DEFAULT 'STORAGE',
    "rankNo" INTEGER NOT NULL DEFAULT 0,
    "maxQty" REAL,
    "maxCubage" REAL,
    "maxWeight" REAL,
    "isEmpty" BOOLEAN NOT NULL DEFAULT true,
    "isBlocked" BOOLEAN NOT NULL DEFAULT false,
    "isDedicated" BOOLEAN NOT NULL DEFAULT false,
    "isSpecial" BOOLEAN NOT NULL DEFAULT false,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "WarehouseBin_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "WarehouseBin_zoneId_fkey" FOREIGN KEY ("zoneId") REFERENCES "WarehouseZone" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_WarehouseBin" ("createdAt", "id", "updatedAt") SELECT "createdAt", "id", "updatedAt" FROM "WarehouseBin";
DROP TABLE "WarehouseBin";
ALTER TABLE "new_WarehouseBin" RENAME TO "WarehouseBin";
CREATE UNIQUE INDEX "WarehouseBin_storeId_code_key" ON "WarehouseBin"("storeId", "code");
CREATE TABLE "new_WarehouseBinContent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "binId" TEXT NOT NULL,
    "productId" TEXT,
    "variantCode" TEXT,
    "unitOfMeasure" TEXT NOT NULL DEFAULT 'EACH',
    "quantity" REAL NOT NULL DEFAULT 0,
    "qtyBase" REAL NOT NULL DEFAULT 0,
    "minQty" REAL NOT NULL DEFAULT 0,
    "maxQty" REAL,
    "lotNo" TEXT,
    "serialNo" TEXT,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "isFixed" BOOLEAN NOT NULL DEFAULT false,
    "lastUpdated" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "WarehouseBinContent_binId_fkey" FOREIGN KEY ("binId") REFERENCES "WarehouseBin" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "WarehouseBinContent_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_WarehouseBinContent" ("createdAt", "id", "updatedAt") SELECT "createdAt", "id", "updatedAt" FROM "WarehouseBinContent";
DROP TABLE "WarehouseBinContent";
ALTER TABLE "new_WarehouseBinContent" RENAME TO "WarehouseBinContent";
CREATE TABLE "new_WarehouseReceipt" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "receiptNo" TEXT NOT NULL,
    "storeId" TEXT,
    "locationCode" TEXT,
    "vendorDocNo" TEXT,
    "postingDate" DATETIME,
    "expectedDate" DATETIME,
    "sourceType" TEXT,
    "sourceId" TEXT,
    "assignedUserId" TEXT,
    "sortingMethod" TEXT,
    "status" TEXT NOT NULL DEFAULT 'open',
    "postedAt" DATETIME,
    "postedBy" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "WarehouseReceipt_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_WarehouseReceipt" ("createdAt", "id", "updatedAt") SELECT "createdAt", "id", "updatedAt" FROM "WarehouseReceipt";
DROP TABLE "WarehouseReceipt";
ALTER TABLE "new_WarehouseReceipt" RENAME TO "WarehouseReceipt";
CREATE UNIQUE INDEX "WarehouseReceipt_receiptNo_key" ON "WarehouseReceipt"("receiptNo");
CREATE TABLE "new_WarehouseReceiptLine" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "receiptId" TEXT NOT NULL,
    "lineNo" INTEGER NOT NULL DEFAULT 0,
    "sourceDocument" TEXT,
    "sourceNo" TEXT,
    "productId" TEXT,
    "description" TEXT,
    "unitOfMeasure" TEXT NOT NULL DEFAULT 'EACH',
    "qtyExpected" REAL NOT NULL DEFAULT 0,
    "qtyReceived" REAL NOT NULL DEFAULT 0,
    "qtyToReceive" REAL NOT NULL DEFAULT 0,
    "zoneCode" TEXT,
    "binCode" TEXT,
    "lotNo" TEXT,
    "serialNo" TEXT,
    "variantCode" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "WarehouseReceiptLine_receiptId_fkey" FOREIGN KEY ("receiptId") REFERENCES "WarehouseReceipt" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "WarehouseReceiptLine_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_WarehouseReceiptLine" ("createdAt", "id", "updatedAt") SELECT "createdAt", "id", "updatedAt" FROM "WarehouseReceiptLine";
DROP TABLE "WarehouseReceiptLine";
ALTER TABLE "new_WarehouseReceiptLine" RENAME TO "WarehouseReceiptLine";
CREATE TABLE "new_WarehouseShipment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "shipmentNo" TEXT NOT NULL,
    "storeId" TEXT,
    "locationCode" TEXT,
    "shippingDate" DATETIME,
    "sourceType" TEXT,
    "sourceId" TEXT,
    "assignedUserId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'open',
    "postedAt" DATETIME,
    "postedBy" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "WarehouseShipment_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_WarehouseShipment" ("createdAt", "id", "updatedAt") SELECT "createdAt", "id", "updatedAt" FROM "WarehouseShipment";
DROP TABLE "WarehouseShipment";
ALTER TABLE "new_WarehouseShipment" RENAME TO "WarehouseShipment";
CREATE UNIQUE INDEX "WarehouseShipment_shipmentNo_key" ON "WarehouseShipment"("shipmentNo");
CREATE TABLE "new_WarehouseShipmentLine" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "shipmentId" TEXT NOT NULL,
    "lineNo" INTEGER NOT NULL DEFAULT 0,
    "sourceDocument" TEXT,
    "sourceNo" TEXT,
    "productId" TEXT,
    "description" TEXT,
    "unitOfMeasure" TEXT NOT NULL DEFAULT 'EACH',
    "qtyOutstanding" REAL NOT NULL DEFAULT 0,
    "qtyPicked" REAL NOT NULL DEFAULT 0,
    "qtyToShip" REAL NOT NULL DEFAULT 0,
    "zoneCode" TEXT,
    "binCode" TEXT,
    "lotNo" TEXT,
    "serialNo" TEXT,
    "variantCode" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "WarehouseShipmentLine_shipmentId_fkey" FOREIGN KEY ("shipmentId") REFERENCES "WarehouseShipment" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "WarehouseShipmentLine_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_WarehouseShipmentLine" ("createdAt", "id", "updatedAt") SELECT "createdAt", "id", "updatedAt" FROM "WarehouseShipmentLine";
DROP TABLE "WarehouseShipmentLine";
ALTER TABLE "new_WarehouseShipmentLine" RENAME TO "WarehouseShipmentLine";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "WarehousePick_pickNo_key" ON "WarehousePick"("pickNo");

-- CreateIndex
CREATE UNIQUE INDEX "WarehousePutAway_putAwayNo_key" ON "WarehousePutAway"("putAwayNo");

-- CreateIndex
CREATE UNIQUE INDEX "WarehouseMovement_movementNo_key" ON "WarehouseMovement"("movementNo");

-- CreateIndex
CREATE UNIQUE INDEX "WarehouseInternalPick_internalPickNo_key" ON "WarehouseInternalPick"("internalPickNo");

-- CreateIndex
CREATE UNIQUE INDEX "SubscriptionOrder_orderNo_key" ON "SubscriptionOrder"("orderNo");

-- CreateIndex
CREATE UNIQUE INDEX "PriceSimulation_simulationNo_key" ON "PriceSimulation"("simulationNo");

-- CreateIndex
CREATE UNIQUE INDEX "SalesCreditMemo_creditMemoNo_key" ON "SalesCreditMemo"("creditMemoNo");

-- CreateIndex
CREATE UNIQUE INDEX "SalesReturnOrder_returnNo_key" ON "SalesReturnOrder"("returnNo");

-- CreateIndex
CREATE UNIQUE INDEX "SalesShipment_shipmentNo_key" ON "SalesShipment"("shipmentNo");

-- CreateIndex
CREATE UNIQUE INDEX "Voyage_voyageNo_key" ON "Voyage"("voyageNo");
