import re

schema_path = 'C:/Users/DeMar/Desktop/2026-year-end-pos/prisma/schema.prisma'
with open(schema_path, 'r', encoding='utf-8') as f:
    content = f.read()

# ── 1. Add WarehouseZone model (prisma.warehouseZone) ────────────────────────
if 'model WarehouseZone' not in content:
    content += '''
// ─── Warehouse Zone ───────────────────────────────────────────────────────────

model WarehouseZone {
  id          String   @id @default(cuid())
  code        String
  storeId     String?
  description String?
  binTypeCode String   @default("PUTPICK")
  rankNo      Int      @default(0)
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  store Store?         @relation("WarehouseZoneStore", fields: [storeId], references: [id])
  bins  WarehouseBin[] @relation("WarehouseBinZone")
}
'''

# ── 2. Add SerialNumber model (prisma.serialNumber) ───────────────────────────
if 'model SerialNumber {' not in content:
    content += '''
// ─── Serial Number ────────────────────────────────────────────────────────────

model SerialNumber {
  id              String    @id @default(cuid())
  serialNo        String    @unique
  productId       String
  itemTrackingId  String?
  status          String    @default("available")
  warrantyDate    DateTime?
  purchaseDate    DateTime?
  soldDate        DateTime?
  notes           String?
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  product      Product       @relation("SerialNumberProduct", fields: [productId], references: [id])
  itemTracking ItemTracking? @relation("ItemTrackingSerialNos", fields: [itemTrackingId], references: [id])
}
'''

# ── 3. Add back-relations to Store for WarehouseZone, WarehouseBin, Receipt, Shipment ──
# Store model - find its last relation line and add after it
# Check what Store's last known line is
if 'warehouseZones' not in content:
    content = content.replace(
        '  warehouseActivities WarehouseActivity[] @relation("WarehouseActivityStore")',
        '''  warehouseActivities  WarehouseActivity[] @relation("WarehouseActivityStore")
  warehouseZones       WarehouseZone[]     @relation("WarehouseZoneStore")
  warehouseBins        WarehouseBin[]      @relation("WarehouseBinStore")
  warehouseReceipts    WarehouseReceipt[]  @relation("WarehouseReceiptStore")
  warehouseShipments   WarehouseShipment[] @relation("WarehouseShipmentStore")'''
    )

# ── 4. Add serialNos back-relation to ItemTracking ────────────────────────────
content = content.replace(
    '''  product  Product            @relation(fields: [productId], references: [id], onDelete: Cascade)
  lotNos   LotNumber[]        @relation("ItemTrackingLotNos")
}''',
    '''  product   Product        @relation(fields: [productId], references: [id], onDelete: Cascade)
  lotNos    LotNumber[]    @relation("ItemTrackingLotNos")
  serialNos SerialNumber[] @relation("ItemTrackingSerialNos")

  @@unique([productId])
}'''
)

# ── 5. Add back-relations to Product for SerialNumber, WarehouseShipmentLine, ReceiptLine, SubcontractingOrderLine ──
content = content.replace(
    '''  warehouseActivityLines   WarehouseActivityLine[]    @relation("WarehouseActivityLineProduct")
}''',
    '''  warehouseActivityLines       WarehouseActivityLine[]      @relation("WarehouseActivityLineProduct")
  serialNumbers                SerialNumber[]               @relation("SerialNumberProduct")
  warehouseShipmentLines       WarehouseShipmentLine[]      @relation("WarehouseShipmentLineProduct")
  warehouseReceiptLines        WarehouseReceiptLine[]       @relation("WarehouseReceiptLineProduct")
  subcontractingOrderLines     SubcontractingOrderLine[]    @relation("SubcontractingOrderLineProduct")
}'''
)

# ── 6. WarehouseBin: add storeId, store, binType, rankNo, maxQty, isBlocked, zone ──
content = content.replace(
    '''model WarehouseBin {
  id          String   @id @default(cuid())
  code        String
  zoneId      String?
  description String?
  maxWeight   Float?
  maxVolume   Float?
  isEmpty     Boolean  @default(true)
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())

  activityLines WarehouseActivityLine[] @relation("ActivityLineBin")
}''',
    '''model WarehouseBin {
  id          String   @id @default(cuid())
  code        String
  zoneId      String?
  storeId     String?
  description String?
  binType     String   @default("STORAGE")
  rankNo      Int      @default(0)
  maxQty      Float?
  maxWeight   Float?
  maxVolume   Float?
  isEmpty     Boolean  @default(true)
  isBlocked   Boolean  @default(false)
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())

  store         Store?                  @relation("WarehouseBinStore", fields: [storeId], references: [id])
  zone          WarehouseZone?          @relation("WarehouseBinZone", fields: [zoneId], references: [id])
  activityLines WarehouseActivityLine[] @relation("ActivityLineBin")
}'''
)

# ── 7. WarehouseReceipt: add storeId, sourceType, sourceId, expectedDate, lines ──
content = content.replace(
    '''model WarehouseReceipt {
  id         String    @id @default(cuid())
  receiptNo  String    @unique @default(cuid())
  sourceNo   String?
  status     String    @default("open")
  receivedAt DateTime?
  createdAt  DateTime  @default(now())
  updatedAt  DateTime  @updatedAt
}''',
    '''model WarehouseReceipt {
  id           String    @id @default(cuid())
  receiptNo    String    @unique @default(cuid())
  storeId      String?
  sourceNo     String?
  sourceType   String?
  sourceId     String?
  status       String    @default("open")
  expectedDate DateTime?
  receivedAt   DateTime?
  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt

  store      Store?                  @relation("WarehouseReceiptStore", fields: [storeId], references: [id])
  lines      WarehouseReceiptLine[]
  activities WarehouseActivity[]    @relation("WarehouseActivityReceipt")
}

model WarehouseReceiptLine {
  id               String    @id @default(cuid())
  receiptId        String
  productId        String?
  qtyExpected      Float     @default(0)
  qtyToReceive     Float     @default(0)
  qtyReceived      Float     @default(0)
  unitOfMeasure    String    @default("EACH")
  lotNo            String?
  serialNo         String?
  destinationBinId String?
  createdAt        DateTime  @default(now())

  receipt  WarehouseReceipt @relation(fields: [receiptId], references: [id], onDelete: Cascade)
  product  Product?         @relation("WarehouseReceiptLineProduct", fields: [productId], references: [id])
}'''
)

# ── 8. WarehouseActivity: add receipt and shipment relations ─────────────────
content = content.replace(
    '''  store Store?                 @relation("WarehouseActivityStore", fields: [storeId], references: [id])
  lines WarehouseActivityLine[]
}''',
    '''  store    Store?                  @relation("WarehouseActivityStore", fields: [storeId], references: [id])
  receipt  WarehouseReceipt?        @relation("WarehouseActivityReceipt", fields: [receiptId], references: [id])
  shipment WarehouseShipment?       @relation("WarehouseActivityShipment", fields: [shipmentId], references: [id])
  lines    WarehouseActivityLine[]
}'''
)

# ── 9. WarehouseShipment: add storeId, store, sourceType, sourceId, activities ──
content = content.replace(
    '''model WarehouseShipment {
  id         String    @id @default(cuid())
  shipmentNo String    @unique @default(cuid())
  sourceNo   String?
  status     String    @default("open")
  shippedAt  DateTime?
  createdAt  DateTime  @default(now())
  updatedAt  DateTime  @updatedAt

  lines WarehouseShipmentLine[]
}''',
    '''model WarehouseShipment {
  id           String    @id @default(cuid())
  shipmentNo   String    @unique @default(cuid())
  storeId      String?
  sourceNo     String?
  sourceType   String?
  sourceId     String?
  shippingDate DateTime?
  status       String    @default("open")
  shippedAt    DateTime?
  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt

  store      Store?                   @relation("WarehouseShipmentStore", fields: [storeId], references: [id])
  lines      WarehouseShipmentLine[]
  activities WarehouseActivity[]      @relation("WarehouseActivityShipment")
}'''
)

# ── 10. WarehouseShipmentLine: add more fields and product relation ───────────
content = content.replace(
    '''model WarehouseShipmentLine {
  id              String    @id @default(cuid())
  shipmentId      String
  productId       String?
  quantity        Float     @default(1)
  quantityShipped Float     @default(0)
  shippingDate    DateTime?
  createdAt       DateTime  @default(now())

  shipment WarehouseShipment @relation(fields: [shipmentId], references: [id], onDelete: Cascade)
}''',
    '''model WarehouseShipmentLine {
  id              String    @id @default(cuid())
  shipmentId      String
  productId       String?
  quantity        Float     @default(1)
  quantityShipped Float     @default(0)
  qtyOutstanding  Float     @default(0)
  qtyToShip       Float     @default(0)
  unitOfMeasure   String    @default("EACH")
  sourceBinId     String?
  shippingDate    DateTime?
  createdAt       DateTime  @default(now())

  shipment WarehouseShipment @relation(fields: [shipmentId], references: [id], onDelete: Cascade)
  product  Product?          @relation("WarehouseShipmentLineProduct", fields: [productId], references: [id])
}'''
)

# ── 11. Project: rename 'entries' to 'ledgerEntries' with named relation ────
content = content.replace(
    '''  tasks         ProjectTask[]
  entries       ProjectEntry[]
  planningLines ProjectPlanningLine[]''',
    '''  tasks         ProjectTask[]
  ledgerEntries ProjectEntry[]        @relation("ProjectLedger")
  planningLines ProjectPlanningLine[]'''
)
# Update back-relation in ProjectEntry
content = content.replace(
    '''  projectId   String
  project     Project      @relation(fields: [projectId], references: [id], onDelete: Cascade)
  taskId      String?
  task        ProjectTask? @relation(fields: [taskId], references: [id])''',
    '''  projectId   String
  project     Project      @relation("ProjectLedger", fields: [projectId], references: [id], onDelete: Cascade)
  taskId      String?
  task        ProjectTask? @relation(fields: [taskId], references: [id])'''
)

# ── 12. ProjectEntry: add totalPrice ─────────────────────────────────────────
content = content.replace(
    '''  billingAmt  Float        @default(0)
  unitPrice   Float        @default(0)
  entryDate   DateTime     @default(now())''',
    '''  billingAmt  Float        @default(0)
  unitPrice   Float        @default(0)
  totalPrice  Float        @default(0)
  entryDate   DateTime     @default(now())'''
)

# ── 13. ProjectTask: add indentation ─────────────────────────────────────────
content = content.replace(
    '''  taskType    String         @default("task")
  entries     ProjectEntry[]
  createdAt   DateTime       @default(now())''',
    '''  taskType    String         @default("task")
  indentation Int            @default(0)
  entries     ProjectEntry[]
  createdAt   DateTime       @default(now())'''
)

# ── 14. ProjectInvoice: add notes, project back-relation ─────────────────────
content = content.replace(
    '''model ProjectInvoice {
  id          String    @id @default(cuid())
  projectId   String
  invoiceNo   String    @unique @default(cuid())
  amount      Float     @default(0)
  status      String    @default("draft")
  dueDate     DateTime?
  invoiceDate DateTime?
  invoicedAt  DateTime?
  createdAt   DateTime  @default(now())

  project Project @relation(fields: [projectId], references: [id], onDelete: Cascade)
}''',
    '''model ProjectInvoice {
  id          String    @id @default(cuid())
  projectId   String
  invoiceNo   String    @unique @default(cuid())
  amount      Float     @default(0)
  status      String    @default("draft")
  notes       String?
  dueDate     DateTime?
  invoiceDate DateTime?
  invoicedAt  DateTime?
  createdAt   DateTime  @default(now())

  project Project @relation(fields: [projectId], references: [id], onDelete: Cascade)
}'''
)

# ── 15. ProjectPlanningLine: add lineType ─────────────────────────────────────
content = content.replace(
    '''  type          String    @default("resource")
  lineType      String    @default("resource")''',
    '''  type          String    @default("resource")'''
)
# Only add lineType if not already there
if '  lineType      String    @default("resource")' not in content:
    content = content.replace(
        '  type          String    @default("resource")',
        '  type          String    @default("resource")\n  lineType      String    @default("resource")'
    )

# ── 16. Project: add budgetAmount ─────────────────────────────────────────────
content = content.replace(
    '  budgetAmt      Float          @default(0)',
    '  budgetAmt      Float          @default(0)\n  budgetAmount   Float          @default(0)'
)

# ── 17. FAInsurance: add description ─────────────────────────────────────────
content = content.replace(
    '''  provider     String
  insurerName  String?
  policyNumber String?''',
    '''  provider     String
  insurerName  String?
  description  String?
  policyNumber String?'''
)

# ── 18. FAMaintenanceLedger: add amount ───────────────────────────────────────
content = content.replace(
    '''  maintenanceDate DateTime  @default(now())
  serviceDate     DateTime?
  maintenanceCode String?
  description     String
  cost            Float     @default(0)''',
    '''  maintenanceDate DateTime  @default(now())
  serviceDate     DateTime?
  maintenanceCode String?
  description     String
  amount          Float     @default(0)
  cost            Float     @default(0)'''
)

# ── 19. FixedAsset: rename insurance to named relation, add insurances alias ──
# Route uses include: { insurances: true } -- add a named alias
# Can't have two fields pointing to same model without named relations.
# Simplest: rename 'insurance' to 'insurances'
content = content.replace(
    '  insurance         FAInsurance[]',
    '  insurances        FAInsurance[]'
)
# Update back-relation name in FAInsurance (if it exists as named)
# FAInsurance.asset is the back-relation - no change needed there

# ── 20. Payment: add vendorId, vendor, type ──────────────────────────────────
content = content.replace(
    '''model Payment {
  id            String    @id @default(cuid())
  orderId       String
  method        String
  amount        Float
  reference     String?
  status        String    @default("completed")
  prepaymentNo  String?
  appliedAmount Float     @default(0)
  customerId    String?
  vendorId      String?
  processedAt   DateTime?
  createdAt     DateTime  @default(now())

  order    Order     @relation(fields: [orderId], references: [id], onDelete: Cascade)
  customer Customer? @relation("PaymentCustomer", fields: [customerId], references: [id])
  vendor   Vendor?   @relation("PaymentVendor", fields: [vendorId], references: [id])
}''',
    '''model Payment {
  id            String    @id @default(cuid())
  orderId       String
  method        String
  type          String    @default("payment")
  amount        Float
  reference     String?
  status        String    @default("completed")
  prepaymentNo  String?
  appliedAmount Float     @default(0)
  customerId    String?
  vendorId      String?
  processedAt   DateTime?
  createdAt     DateTime  @default(now())

  order    Order     @relation(fields: [orderId], references: [id], onDelete: Cascade)
  customer Customer? @relation("PaymentCustomer", fields: [customerId], references: [id])
  vendor   Vendor?   @relation("PaymentVendor", fields: [vendorId], references: [id])
}'''
)

# Ensure Payment doesn't already have type field (avoid duplicate)
# Also add back-relation to Vendor for Payment
if 'payments  Payment[]' not in content and 'payments Payment[]' not in content:
    content = content.replace(
        '''  subcontractingOrders   SubcontractingOrder[]
}''',
        '''  subcontractingOrders   SubcontractingOrder[]
  payments               Payment[]             @relation("PaymentVendor")
}'''
    )

# ── 21. SLAPolicy: add firstResponseHours, resolutionHours ────────────────────
content = content.replace(
    '''model SLAPolicy {
  id          String   @id @default(cuid())
  name        String
  description String?
  isDefault   Boolean  @default(false)
  applicableTo String?
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  items SLAItem[]
}''',
    '''model SLAPolicy {
  id                  String   @id @default(cuid())
  name                String
  description         String?
  isDefault           Boolean  @default(false)
  applicableTo        String?
  firstResponseHours  Int      @default(8)
  resolutionHours     Int      @default(24)
  isActive            Boolean  @default(true)
  createdAt           DateTime @default(now())
  updatedAt           DateTime @updatedAt

  items SLAItem[]
}'''
)

# ── 22. SLAItem: add status, pausedAt ────────────────────────────────────────
content = content.replace(
    '''  firstResponseDeadline  DateTime?
  resolutionDeadline     DateTime?
  breached               Boolean   @default(false)
  breachedAt             DateTime?
  createdAt              DateTime  @default(now())

  policy SLAPolicy @relation(fields: [policyId], references: [id], onDelete: Cascade)
}''',
    '''  firstResponseDeadline  DateTime?
  resolutionDeadline     DateTime?
  breached               Boolean   @default(false)
  breachedAt             DateTime?
  status                 String    @default("active")
  pausedAt               DateTime?
  createdAt              DateTime  @default(now())

  policy SLAPolicy @relation(fields: [policyId], references: [id], onDelete: Cascade)
}'''
)

# ── 23. NumberSeriesLog: add createdAt ────────────────────────────────────────
content = content.replace(
    '''  usedFor         String?
  usedBy          String?
  usedById        String?
  usedAt          DateTime @default(now())

  series NumberSeries @relation(fields: [seriesId], references: [id], onDelete: Cascade)
}''',
    '''  usedFor         String?
  usedBy          String?
  usedById        String?
  usedAt          DateTime @default(now())
  createdAt       DateTime @default(now())

  series NumberSeries @relation(fields: [seriesId], references: [id], onDelete: Cascade)
}'''
)

# ── 24. LotNumber: add createdAt, named product relation ─────────────────────
content = content.replace(
    '''  itemTrackingId String?
  isExpired      Boolean   @default(false)
  isBlocked      Boolean   @default(false)
  rankNo         Int?
  notes          String?

  product      Product          @relation(fields: [productId], references: [id])
  supplier     Supplier?        @relation(fields: [supplierId], references: [id])
  movements    LotMovement[]
  itemTracking ItemTracking?    @relation("ItemTrackingLotNos", fields: [itemTrackingId], references: [id])
}''',
    '''  itemTrackingId String?
  isExpired      Boolean   @default(false)
  isBlocked      Boolean   @default(false)
  rankNo         Int?
  notes          String?
  createdAt      DateTime  @default(now())

  product      Product          @relation("LotNumberProduct", fields: [productId], references: [id])
  supplier     Supplier?        @relation(fields: [supplierId], references: [id])
  movements    LotMovement[]
  itemTracking ItemTracking?    @relation("ItemTrackingLotNos", fields: [itemTrackingId], references: [id])
}'''
)
# Update Product.lotNumbers to use named relation
content = content.replace(
    '  lotNumbers            LotNumber[]',
    '  lotNumbers            LotNumber[]       @relation("LotNumberProduct")'
)

# ── 25. SubcontractingOrderLine: add product relation ─────────────────────────
content = content.replace(
    '''  order SubcontractingOrder @relation(fields: [orderId], references: [id], onDelete: Cascade)
}

// ─── Transfer Lines''',
    '''  order   SubcontractingOrder @relation(fields: [orderId], references: [id], onDelete: Cascade)
  product Product?            @relation("SubcontractingOrderLineProduct", fields: [productId], references: [id])
}

// ─── Transfer Lines'''
)

# ── 26. WmsBinContent: add lastUpdated ────────────────────────────────────────
content = content.replace(
    '''  state         String   @default("AVAILABLE")
  unitOfMeasure String   @default("each")
  updatedAt     DateTime @updatedAt''',
    '''  state         String   @default("AVAILABLE")
  unitOfMeasure String   @default("each")
  lastUpdated   DateTime @default(now())
  updatedAt     DateTime @updatedAt'''
)

# ── 27. WarehouseActivityLine: add isHandled ─────────────────────────────────
content = content.replace(
    '''  lotNo           String?
  serialNo        String?
  createdAt       DateTime @default(now())

  activity WarehouseActivity @relation(fields: [activityId], references: [id], onDelete: Cascade)''',
    '''  lotNo           String?
  serialNo        String?
  isHandled       Boolean  @default(false)
  createdAt       DateTime @default(now())

  activity WarehouseActivity @relation(fields: [activityId], references: [id], onDelete: Cascade)'''
)

# ── 28. WarehouseBin: add zone relation for 'zone' include in route ──────────
# The WarehouseBin already has zone field from step 6.
# Route does select: { zone: { select... } } on WarehouseBinSelect
# This is now covered.

# ── 29. WarehouseShipmentLine: add qtyPicked ──────────────────────────────────
content = content.replace(
    '''  qtyOutstanding  Float     @default(0)
  qtyToShip       Float     @default(0)
  unitOfMeasure   String    @default("EACH")
  sourceBinId     String?
  shippingDate    DateTime?''',
    '''  qtyOutstanding  Float     @default(0)
  qtyToShip       Float     @default(0)
  qtyPicked       Float     @default(0)
  unitOfMeasure   String    @default("EACH")
  sourceBinId     String?
  shippingDate    DateTime?'''
)

with open(schema_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Done applying fix_schema3 replacements")
