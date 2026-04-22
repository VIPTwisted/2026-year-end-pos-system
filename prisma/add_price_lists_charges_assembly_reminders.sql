-- 2026-year-end-pos: Price Lists, Item Charges, Assembly Orders (BC spec), Reminders, Finance Charge Memos
-- Run: node -e "require('./create_bc_tables.mjs')" or apply directly to dev.db

CREATE TABLE IF NOT EXISTS "SalesPriceList" (
  "id" TEXT PRIMARY KEY,
  "code" TEXT UNIQUE,
  "description" TEXT,
  "assignToType" TEXT DEFAULT 'All Customers',
  "assignTo" TEXT,
  "currency" TEXT DEFAULT 'USD',
  "startingDate" TEXT,
  "endingDate" TEXT,
  "status" TEXT DEFAULT 'Draft',
  "createdAt" DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "SalesPriceListLine" (
  "id" TEXT PRIMARY KEY,
  "priceListId" TEXT,
  "productType" TEXT DEFAULT 'Item',
  "productNo" TEXT,
  "description" TEXT,
  "unitOfMeasure" TEXT DEFAULT 'each',
  "minQty" REAL DEFAULT 0,
  "unitPrice" REAL DEFAULT 0,
  "allowLineDisc" INTEGER DEFAULT 1
);

CREATE TABLE IF NOT EXISTS "PurchasePriceList" (
  "id" TEXT PRIMARY KEY,
  "code" TEXT UNIQUE,
  "description" TEXT,
  "assignToType" TEXT DEFAULT 'All Vendors',
  "assignTo" TEXT,
  "currency" TEXT DEFAULT 'USD',
  "startingDate" TEXT,
  "endingDate" TEXT,
  "status" TEXT DEFAULT 'Draft',
  "createdAt" DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "PurchasePriceListLine" (
  "id" TEXT PRIMARY KEY,
  "priceListId" TEXT,
  "productType" TEXT DEFAULT 'Item',
  "productNo" TEXT,
  "description" TEXT,
  "unitOfMeasure" TEXT DEFAULT 'each',
  "minQty" REAL DEFAULT 0,
  "directUnitCost" REAL DEFAULT 0,
  "allowLineDisc" INTEGER DEFAULT 1
);

CREATE TABLE IF NOT EXISTS "ItemCharge" (
  "id" TEXT PRIMARY KEY,
  "chargeNo" TEXT UNIQUE,
  "description" TEXT,
  "genProdPostingGroup" TEXT,
  "vatProdPostingGroup" TEXT,
  "createdAt" DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "BcAssemblyOrder" (
  "id" TEXT PRIMARY KEY,
  "orderNo" TEXT UNIQUE,
  "itemNo" TEXT,
  "description" TEXT,
  "qtyToAssemble" REAL DEFAULT 1,
  "qtyAssembled" REAL DEFAULT 0,
  "unitOfMeasure" TEXT DEFAULT 'PCS',
  "dueDate" TEXT,
  "startingDate" TEXT,
  "status" TEXT DEFAULT 'Open',
  "locationCode" TEXT,
  "binCode" TEXT,
  "unitCost" REAL DEFAULT 0,
  "notes" TEXT,
  "createdAt" DATETIME DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "BcAssemblyOrderLine" (
  "id" TEXT PRIMARY KEY,
  "assemblyOrderId" TEXT,
  "lineNo" INTEGER DEFAULT 0,
  "type" TEXT DEFAULT 'Item',
  "itemNo" TEXT,
  "description" TEXT,
  "qty" REAL DEFAULT 1,
  "unitOfMeasure" TEXT DEFAULT 'PCS',
  "unitCost" REAL DEFAULT 0,
  "createdAt" DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "BcAssemblyBOM" (
  "id" TEXT PRIMARY KEY,
  "parentItemNo" TEXT,
  "description" TEXT,
  "unitOfMeasure" TEXT DEFAULT 'PCS',
  "qty" REAL DEFAULT 1,
  "type" TEXT DEFAULT 'Item',
  "componentNo" TEXT,
  "componentDescription" TEXT,
  "createdAt" DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "BcReminder" (
  "id" TEXT PRIMARY KEY,
  "reminderNo" TEXT UNIQUE,
  "customerId" TEXT,
  "customerNo" TEXT,
  "customerName" TEXT,
  "postingDate" TEXT,
  "dueDate" TEXT,
  "status" TEXT DEFAULT 'Draft',
  "reminderLevel" INTEGER DEFAULT 1,
  "remainingAmount" REAL DEFAULT 0,
  "interestAmount" REAL DEFAULT 0,
  "reminderFee" REAL DEFAULT 0,
  "notes" TEXT,
  "issuedAt" TEXT,
  "createdAt" DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "BcReminderLine" (
  "id" TEXT PRIMARY KEY,
  "reminderId" TEXT,
  "lineNo" INTEGER DEFAULT 0,
  "description" TEXT,
  "remainingAmount" REAL DEFAULT 0,
  "interestAmount" REAL DEFAULT 0,
  "documentType" TEXT,
  "documentNo" TEXT,
  "dueDate" TEXT
);

CREATE TABLE IF NOT EXISTS "FinanceChargeMemo" (
  "id" TEXT PRIMARY KEY,
  "memoNo" TEXT UNIQUE,
  "customerId" TEXT,
  "customerNo" TEXT,
  "customerName" TEXT,
  "postingDate" TEXT,
  "dueDate" TEXT,
  "status" TEXT DEFAULT 'Draft',
  "amount" REAL DEFAULT 0,
  "interestAmount" REAL DEFAULT 0,
  "financeChargeFee" REAL DEFAULT 0,
  "currency" TEXT DEFAULT 'USD',
  "notes" TEXT,
  "issuedAt" TEXT,
  "createdAt" DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "FinanceChargeMemoLine" (
  "id" TEXT PRIMARY KEY,
  "memoId" TEXT,
  "lineNo" INTEGER DEFAULT 0,
  "description" TEXT,
  "remainingAmount" REAL DEFAULT 0,
  "interestAmount" REAL DEFAULT 0,
  "documentType" TEXT,
  "documentNo" TEXT,
  "dueDate" TEXT
);
