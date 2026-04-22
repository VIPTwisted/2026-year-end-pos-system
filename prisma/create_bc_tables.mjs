import { createClient } from '@libsql/client';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dbPath = join(__dirname, 'dev.db');

const client = createClient({ url: `file:${dbPath}` });

const statements = [
  // Update SalesOrder with new columns (add if missing)
  `ALTER TABLE SalesOrder ADD COLUMN sellToCustomerId TEXT`,
  `ALTER TABLE SalesOrder ADD COLUMN sellToCustomerName TEXT`,
  `ALTER TABLE SalesOrder ADD COLUMN billToCustomerId TEXT`,
  `ALTER TABLE SalesOrder ADD COLUMN billToCustomerName TEXT`,
  `ALTER TABLE SalesOrder ADD COLUMN externalDocNo TEXT`,
  `ALTER TABLE SalesOrder ADD COLUMN salespersonCode TEXT`,
  `ALTER TABLE SalesOrder ADD COLUMN status TEXT NOT NULL DEFAULT 'Open'`,
  `ALTER TABLE SalesOrder ADD COLUMN orderDate DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP`,
  `ALTER TABLE SalesOrder ADD COLUMN postingDate DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP`,
  `ALTER TABLE SalesOrder ADD COLUMN shipToName TEXT`,
  `ALTER TABLE SalesOrder ADD COLUMN shipToAddress TEXT`,
  `ALTER TABLE SalesOrder ADD COLUMN shipToCity TEXT`,
  `ALTER TABLE SalesOrder ADD COLUMN shipToState TEXT`,
  `ALTER TABLE SalesOrder ADD COLUMN shipToZip TEXT`,
  `ALTER TABLE SalesOrder ADD COLUMN shippingAgentCode TEXT`,
  `ALTER TABLE SalesOrder ADD COLUMN subtotal REAL NOT NULL DEFAULT 0`,
  `ALTER TABLE SalesOrder ADD COLUMN discountAmount REAL NOT NULL DEFAULT 0`,
  `ALTER TABLE SalesOrder ADD COLUMN taxAmount REAL NOT NULL DEFAULT 0`,

  // Update SalesOrderItem
  `ALTER TABLE SalesOrderItem ADD COLUMN lineType TEXT NOT NULL DEFAULT 'Item'`,
  `ALTER TABLE SalesOrderItem ADD COLUMN itemNo TEXT`,
  `ALTER TABLE SalesOrderItem ADD COLUMN description TEXT NOT NULL DEFAULT ''`,
  `ALTER TABLE SalesOrderItem ADD COLUMN unitPrice REAL NOT NULL DEFAULT 0`,
  `ALTER TABLE SalesOrderItem ADD COLUMN discountPct REAL NOT NULL DEFAULT 0`,
  `ALTER TABLE SalesOrderItem ADD COLUMN lineTotal REAL NOT NULL DEFAULT 0`,

  // Update SalesInvoice
  `ALTER TABLE SalesInvoice ADD COLUMN sellToCustomerId TEXT`,
  `ALTER TABLE SalesInvoice ADD COLUMN sellToCustomerName TEXT`,
  `ALTER TABLE SalesInvoice ADD COLUMN externalDocNo TEXT`,
  `ALTER TABLE SalesInvoice ADD COLUMN salespersonCode TEXT`,
  `ALTER TABLE SalesInvoice ADD COLUMN postingDate DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP`,
  `ALTER TABLE SalesInvoice ADD COLUMN subtotal REAL NOT NULL DEFAULT 0`,
  `ALTER TABLE SalesInvoice ADD COLUMN discountAmount REAL NOT NULL DEFAULT 0`,
  `ALTER TABLE SalesInvoice ADD COLUMN taxAmount REAL NOT NULL DEFAULT 0`,
  `ALTER TABLE SalesInvoice ADD COLUMN remainingAmount REAL NOT NULL DEFAULT 0`,

  // Update SalesInvoiceItem
  `ALTER TABLE SalesInvoiceItem ADD COLUMN lineType TEXT NOT NULL DEFAULT 'Item'`,
  `ALTER TABLE SalesInvoiceItem ADD COLUMN itemNo TEXT`,
  `ALTER TABLE SalesInvoiceItem ADD COLUMN description TEXT NOT NULL DEFAULT ''`,
  `ALTER TABLE SalesInvoiceItem ADD COLUMN unitPrice REAL NOT NULL DEFAULT 0`,
  `ALTER TABLE SalesInvoiceItem ADD COLUMN discountPct REAL NOT NULL DEFAULT 0`,

  // Update SalesQuote
  `ALTER TABLE SalesQuote ADD COLUMN sellToCustomerName TEXT`,
  `ALTER TABLE SalesQuote ADD COLUMN billToCustomerId TEXT`,
  `ALTER TABLE SalesQuote ADD COLUMN billToCustomerName TEXT`,
  `ALTER TABLE SalesQuote ADD COLUMN externalDocNo TEXT`,
  `ALTER TABLE SalesQuote ADD COLUMN salespersonCode TEXT`,
  `ALTER TABLE SalesQuote ADD COLUMN quoteDate DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP`,
  `ALTER TABLE SalesQuote ADD COLUMN postingDate DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP`,
  `ALTER TABLE SalesQuote ADD COLUMN shipToName TEXT`,
  `ALTER TABLE SalesQuote ADD COLUMN shipToAddress TEXT`,
  `ALTER TABLE SalesQuote ADD COLUMN shippingAgentCode TEXT`,

  // Update SalesQuoteLine
  `ALTER TABLE SalesQuoteLine ADD COLUMN lineType TEXT NOT NULL DEFAULT 'Item'`,
  `ALTER TABLE SalesQuoteLine ADD COLUMN itemNo TEXT`,

  // Update PriceList
  `ALTER TABLE PriceList ADD COLUMN code TEXT`,
  `ALTER TABLE PriceList ADD COLUMN description TEXT`,
  `ALTER TABLE PriceList ADD COLUMN status TEXT NOT NULL DEFAULT 'Draft'`,

  // Create new tables
  `CREATE TABLE IF NOT EXISTS SalesCreditMemo (
    id TEXT NOT NULL PRIMARY KEY,
    creditMemoNo TEXT NOT NULL UNIQUE,
    sellToCustomerId TEXT,
    sellToCustomerName TEXT,
    externalDocNo TEXT,
    salespersonCode TEXT,
    status TEXT NOT NULL DEFAULT 'Open',
    postingDate DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    dueDate DATETIME,
    subtotal REAL NOT NULL DEFAULT 0,
    discountAmount REAL NOT NULL DEFAULT 0,
    taxAmount REAL NOT NULL DEFAULT 0,
    totalAmount REAL NOT NULL DEFAULT 0,
    notes TEXT,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,

  `CREATE TABLE IF NOT EXISTS SalesCreditMemoLine (
    id TEXT NOT NULL PRIMARY KEY,
    creditMemoId TEXT NOT NULL,
    lineType TEXT NOT NULL DEFAULT 'Item',
    itemNo TEXT,
    description TEXT NOT NULL DEFAULT '',
    quantity REAL NOT NULL DEFAULT 1,
    unitPrice REAL NOT NULL DEFAULT 0,
    discountPct REAL NOT NULL DEFAULT 0,
    lineTotal REAL NOT NULL DEFAULT 0,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (creditMemoId) REFERENCES SalesCreditMemo(id) ON DELETE CASCADE
  )`,

  `CREATE TABLE IF NOT EXISTS SalesReturnOrder (
    id TEXT NOT NULL PRIMARY KEY,
    returnNo TEXT NOT NULL UNIQUE,
    sellToCustomerId TEXT,
    sellToCustomerName TEXT,
    externalDocNo TEXT,
    status TEXT NOT NULL DEFAULT 'Open',
    returnDate DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    postingDate DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    subtotal REAL NOT NULL DEFAULT 0,
    totalAmount REAL NOT NULL DEFAULT 0,
    notes TEXT,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,

  `CREATE TABLE IF NOT EXISTS SalesReturnOrderLine (
    id TEXT NOT NULL PRIMARY KEY,
    returnOrderId TEXT NOT NULL,
    lineType TEXT NOT NULL DEFAULT 'Item',
    itemNo TEXT,
    description TEXT NOT NULL DEFAULT '',
    quantity REAL NOT NULL DEFAULT 1,
    unitPrice REAL NOT NULL DEFAULT 0,
    lineTotal REAL NOT NULL DEFAULT 0,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (returnOrderId) REFERENCES SalesReturnOrder(id) ON DELETE CASCADE
  )`,

  `CREATE TABLE IF NOT EXISTS SalesShipment (
    id TEXT NOT NULL PRIMARY KEY,
    shipmentNo TEXT NOT NULL UNIQUE,
    orderId TEXT,
    sellToCustomerName TEXT,
    postingDate DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    shipToName TEXT,
    shipToAddress TEXT,
    shippingAgentCode TEXT,
    status TEXT NOT NULL DEFAULT 'Posted',
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (orderId) REFERENCES SalesOrder(id)
  )`,
];

async function run() {
  let ok = 0;
  let skipped = 0;
  for (const sql of statements) {
    try {
      await client.execute(sql);
      ok++;
    } catch (e) {
      if (e.message && (e.message.includes('duplicate column') || e.message.includes('already exists'))) {
        skipped++;
      } else {
        console.error('FAIL:', sql.substring(0, 60), e.message);
      }
    }
  }
  console.log(`Done: ${ok} applied, ${skipped} skipped (already exist)`);
  await client.close();
}

run();
