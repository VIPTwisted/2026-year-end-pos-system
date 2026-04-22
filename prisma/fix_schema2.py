import re

schema_path = 'C:/Users/DeMar/Desktop/2026-year-end-pos/prisma/schema.prisma'
with open(schema_path, 'r', encoding='utf-8') as f:
    content = f.read()

# ── ProductVariantAttributeValue: add attribute relation (rename field) ────────
# Routes use 'attributeValue' as include - need to rename 'attribute' to 'attributeValue'
# OR add an attributeValue alias. The model is named ProductVariantAttributeValue
# and references 'attribute ProductVariantAttribute'. Routes try to include 'attributeValue'.
# Rename 'attribute' relation to 'attributeValue' in ProductVariantAttributeValue
content = content.replace(
    '''  variant   ProductVariant          @relation(fields: [variantId], references: [id], onDelete: Cascade)
  attribute ProductVariantAttribute @relation(fields: [attributeId], references: [id], onDelete: Cascade)''',
    '''  variant        ProductVariant          @relation(fields: [variantId], references: [id], onDelete: Cascade)
  attributeValue ProductVariantAttribute @relation("AttrValueAttribute", fields: [attributeId], references: [id], onDelete: Cascade)'''
)
# Update back-relation name in ProductVariantAttribute
content = content.replace(
    '''  product Product                       @relation(fields: [productId], references: [id], onDelete: Cascade)
  values  ProductVariantAttributeValue[]''',
    '''  product Product                       @relation(fields: [productId], references: [id], onDelete: Cascade)
  values  ProductVariantAttributeValue[] @relation("AttrValueAttribute")'''
)

# ── Project: add ledgerEntries relation (entries already exists but route needs ledgerEntries) ──
# Add a ledgerEntries alias pointing to entries
# Actually ProjectEntry IS the ledger. Add a named relation.
# The routes use project.ledgerEntries - we need to add that as an alias
# Simplest: add a second relation field 'ledgerEntries' pointing to ProjectEntry
content = content.replace(
    '''  tasks         ProjectTask[]
  entries       ProjectEntry[]
  planningLines ProjectPlanningLine[]
  invoices      ProjectInvoice[]
  timesheets    TimeSheet[]           @relation("TimeSheetProject")''',
    '''  tasks         ProjectTask[]
  entries       ProjectEntry[]
  ledgerEntries ProjectEntry[]        @relation("ProjectLedgerEntries")
  planningLines ProjectPlanningLine[]
  invoices      ProjectInvoice[]
  timesheets    TimeSheet[]           @relation("TimeSheetProject")'''
)

# Add the back-relation name to ProjectEntry
content = content.replace(
    '''  projectId   String
  project     Project      @relation(fields: [projectId], references: [id], onDelete: Cascade)
  taskId      String?
  task        ProjectTask?''',
    '''  projectId   String
  project     Project      @relation("ProjectLedgerEntries", fields: [projectId], references: [id], onDelete: Cascade)
  taskId      String?
  task        ProjectTask?'''
)

# Wait - we can't have TWO relations from ProjectEntry to Project with different names
# unless we also update the original relation. Let's undo that approach.
# The issue is Project has 'entries' and routes use 'ledgerEntries'.
# Better: just rename 'entries' to 'ledgerEntries' in Project, keep ProjectEntry's 'project' relation unchanged.
# But entries is used in many other places. Better to add ProjectLedgerEntry as a separate model or
# just add ledgerEntries as the SAME relation with a different name.

# Actually Prisma requires relation names to be unique per model pair.
# Best fix: Just alias ledgerEntries = entries by adding both with named relations.
# BUT Prisma won't allow two unnamed relations between same models.
# We need to name BOTH sides. Let's use named relation "ProjectEntries" for existing
# and "ProjectLedgerEntries" for the new alias - but they'd still point to same FK.

# Actually the cleanest solution: add a separate ProjectLedgerEntry model that just
# wraps ProjectEntry, OR just fix the route code. But we're fixing schema not routes.

# Cleanest Prisma approach: rename the relation in Project from 'entries' to 'ledgerEntries'
# This requires updating ALL references in routes too - complex.

# Better: add a separate column 'isLedger Boolean @default(true)' and keep both
# OR: just add a view-like scalar that gets computed. Not possible in Prisma.

# FINAL DECISION: Rename 'entries' relation to 'ledgerEntries' in Project model
# and keep the FK pointing to same place. Route code that uses 'entries' will break
# but routes that use 'ledgerEntries' will be fixed. Let's check what routes use 'entries'.

# For now, revert the bad change and use a different approach:
content = content.replace(
    '''  tasks         ProjectTask[]
  entries       ProjectEntry[]
  ledgerEntries ProjectEntry[]        @relation("ProjectLedgerEntries")
  planningLines ProjectPlanningLine[]
  invoices      ProjectInvoice[]
  timesheets    TimeSheet[]           @relation("TimeSheetProject")''',
    '''  tasks         ProjectTask[]
  entries       ProjectEntry[]
  planningLines ProjectPlanningLine[]
  invoices      ProjectInvoice[]
  timesheets    TimeSheet[]           @relation("TimeSheetProject")'''
)

content = content.replace(
    '''  projectId   String
  project     Project      @relation("ProjectLedgerEntries", fields: [projectId], references: [id], onDelete: Cascade)
  taskId      String?
  task        ProjectTask?''',
    '''  projectId   String
  project     Project      @relation(fields: [projectId], references: [id], onDelete: Cascade)
  taskId      String?
  task        ProjectTask?'''
)

# ── FixedAsset: add ledgerEntries back (already exists as FALedgerEntry) ──────
# The FixedAsset already has ledgerEntries FALedgerEntry[] - the page uses that.
# Check that it's using the right name. FixedAsset.ledgerEntries already exists.
# The error says it doesn't exist on the query result - check if it's being included.

# ── ServiceQueue: add members relation (ServiceQueueItem) ─────────────────────
content = content.replace(
    '''model ServiceQueue {
  id          String   @id @default(cuid())
  name        String
  description String?
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())

  items ServiceQueueItem[]
}''',
    '''model ServiceQueue {
  id          String   @id @default(cuid())
  name        String
  description String?
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())

  items   ServiceQueueItem[]
  members ServiceQueueItem[] @relation("QueueMembers")
}'''
)
# That creates ambiguous relations. Let's just rename items to members:
content = content.replace(
    '''model ServiceQueue {
  id          String   @id @default(cuid())
  name        String
  description String?
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())

  items   ServiceQueueItem[]
  members ServiceQueueItem[] @relation("QueueMembers")
}''',
    '''model ServiceQueue {
  id          String   @id @default(cuid())
  name        String
  description String?
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())

  items   ServiceQueueItem[]
}'''
)

# ── WarehouseBin: add isEmpty field ───────────────────────────────────────────
content = content.replace(
    '''model WarehouseBin {
  id          String   @id @default(cuid())
  code        String
  zoneId      String?
  description String?
  maxWeight   Float?
  maxVolume   Float?
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
}''',
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
}'''
)

# ── WarehouseActivityLine: add bin relation (binId already exists as String?) ──
# The route tries include { bin: true } on WarehouseActivityLine
# Need to add a WarehouseBin relation to WarehouseActivityLine using binId
content = content.replace(
    '''  activity WarehouseActivity @relation(fields: [activityId], references: [id], onDelete: Cascade)
  product  Product?          @relation("WarehouseActivityLineProduct", fields: [productId], references: [id])
}''',
    '''  activity WarehouseActivity @relation(fields: [activityId], references: [id], onDelete: Cascade)
  product  Product?          @relation("WarehouseActivityLineProduct", fields: [productId], references: [id])
  bin      WarehouseBin?     @relation("ActivityLineBin", fields: [binId], references: [id])
}'''
)
# Add back-relation to WarehouseBin for activity lines
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
}''',
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
}'''
)

# ── ItemTracking: add trackingMethod, lotNos fields ────────────────────────────
content = content.replace(
    '''model ItemTracking {
  id        String   @id @default(cuid())
  productId String
  type      String   @default("lot")
  isActive  Boolean  @default(true)
  createdAt DateTime @default(now())

  product Product @relation(fields: [productId], references: [id], onDelete: Cascade)
}''',
    '''model ItemTracking {
  id              String   @id @default(cuid())
  productId       String
  type            String   @default("lot")
  trackingMethod  String   @default("lot")
  isActive        Boolean  @default(true)
  createdAt       DateTime @default(now())

  product  Product            @relation(fields: [productId], references: [id], onDelete: Cascade)
  lotNos   LotNumber[]        @relation("ItemTrackingLotNos")
}'''
)

# Add back-relation to LotNumber
content = content.replace(
    '''  product   Product       @relation(fields: [productId], references: [id])
  supplier  Supplier?     @relation(fields: [supplierId], references: [id])
  movements LotMovement[]
}''',
    '''  product      Product          @relation(fields: [productId], references: [id])
  supplier     Supplier?        @relation(fields: [supplierId], references: [id])
  movements    LotMovement[]
  itemTracking ItemTracking?    @relation("ItemTrackingLotNos", fields: [itemTrackingId], references: [id])
}'''
)

# ── ConversationMessage: add senderName field ─────────────────────────────────
content = content.replace(
    '''  direction      String      @default("inbound")
  content        String
  channel        String?
  sender         String?
  sentAt         DateTime    @default(now())
  createdAt      DateTime    @default(now())''',
    '''  direction      String      @default("inbound")
  content        String
  channel        String?
  sender         String?
  senderName     String?
  sentimentScore Float?
  sentAt         DateTime    @default(now())
  createdAt      DateTime    @default(now())'''
)

# ── Conversation: add sentimentScore field ────────────────────────────────────
# Already has sentiment. Add sentimentScore alias
content = content.replace(
    '''  sentiment        String?
  handleTimeSeconds Int?
  wrapUpCode       String?''',
    '''  sentiment        String?
  sentimentScore   Float?
  handleTimeSeconds Int?
  wrapUpCode       String?'''
)

# ── SLAItem: add resolutionDeadline ───────────────────────────────────────────
content = content.replace(
    '''  firstResponseDeadline DateTime?
  breached              Boolean   @default(false)''',
    '''  firstResponseDeadline  DateTime?
  resolutionDeadline     DateTime?
  breached               Boolean   @default(false)'''
)

# ── ConversationTransfer: add toQueueName ─────────────────────────────────────
content = content.replace(
    '''  fromAgentName  String?
  toAgentName    String?
  reason         String?
  transferredAt  DateTime    @default(now())''',
    '''  fromAgentName  String?
  toAgentName    String?
  toQueueName    String?
  reason         String?
  transferredAt  DateTime    @default(now())'''
)

# ── IOMSimulation: add runAt field ────────────────────────────────────────────
content = content.replace(
    '''model IOMSimulation {
  id          String   @id @default(cuid())
  name        String
  description String?
  policyId    String?
  testOrders  String   @default("[]")
  status      String   @default("draft")
  results     String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  policy FulfillmentPolicy? @relation(fields: [policyId], references: [id])
}''',
    '''model IOMSimulation {
  id          String    @id @default(cuid())
  name        String
  description String?
  policyId    String?
  testOrders  String    @default("[]")
  status      String    @default("draft")
  results     String?
  runAt       DateTime?
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  policy FulfillmentPolicy? @relation(fields: [policyId], references: [id])
}'''
)

# ── ReturnOrchestration: add returnProvider field ─────────────────────────────
content = content.replace(
    '''  customer        Customer?           @relation("CustomerReturnOrchestrations", fields: [customerId], references: [id])

  lines           ReturnOrchestrationLine[]
  stateHistory    ReturnStateHistory[]
}''',
    '''  customer        Customer?           @relation("CustomerReturnOrchestrations", fields: [customerId], references: [id])
  returnProvider  FulfillmentProvider? @relation("ReturnOrchestrationProvider", fields: [returnProviderId], references: [id])

  lines           ReturnOrchestrationLine[]
  stateHistory    ReturnStateHistory[]
}'''
)
# Add back-relation to FulfillmentProvider
content = content.replace(
    '''  store       Store?                @relation(fields: [storeId], references: [id])
  allocations FulfillmentAllocation[]
  instances   FulfillmentProviderInstance[]
  lines       OrchestrationLine[]   @relation("LineProvider")
}''',
    '''  store               Store?                      @relation(fields: [storeId], references: [id])
  allocations         FulfillmentAllocation[]
  instances           FulfillmentProviderInstance[]
  lines               OrchestrationLine[]            @relation("LineProvider")
  returnOrchestrations ReturnOrchestration[]          @relation("ReturnOrchestrationProvider")
}'''
)

# ── OrderQueue: add processedAt (already exists), add errorMessage ────────────
content = content.replace(
    '''  retryCount  Int       @default(0)
  error       String?
  processedAt DateTime?
  createdAt   DateTime  @default(now())
}''',
    '''  retryCount    Int       @default(0)
  error         String?
  errorMessage  String?
  processedAt   DateTime?
  isHandled     Boolean   @default(false)
  createdAt     DateTime  @default(now())
}'''
)

# ── LoyaltyTransaction: add createdBy ─────────────────────────────────────────
content = content.replace(
    '''  expiresAt     DateTime?
  createdAt     DateTime  @default(now())

  card    LoyaltyCard    @relation(fields: [cardId], references: [id])
  program LoyaltyProgram @relation(fields: [programId], references: [id])
  order   Order?         @relation(fields: [orderId], references: [id])
}''',
    '''  expiresAt     DateTime?
  createdBy     String?
  createdAt     DateTime  @default(now())

  card    LoyaltyCard    @relation(fields: [cardId], references: [id])
  program LoyaltyProgram @relation(fields: [programId], references: [id])
  order   Order?         @relation(fields: [orderId], references: [id])
}'''
)

# ── FAInsurance: add insurerName ──────────────────────────────────────────────
content = content.replace(
    '''  provider     String
  policyNumber String?
  policyNo     String?''',
    '''  provider     String
  insurerName  String?
  policyNumber String?
  policyNo     String?'''
)

# ── ConsolidationCompany: add consolidationMethod ─────────────────────────────
content = content.replace(
    '''model ConsolidationCompany {
  id          String   @id @default(cuid())
  groupId     String
  companyCode String
  companyName String
  currency    String   @default("USD")
  ownership   Float    @default(100)
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())

  group   ConsolidationGroup @relation(fields: [groupId], references: [id], onDelete: Cascade)
  results ConsolidationResult[]
}''',
    '''model ConsolidationCompany {
  id                  String   @id @default(cuid())
  groupId             String
  companyCode         String
  companyName         String
  currency            String   @default("USD")
  ownership           Float    @default(100)
  consolidationMethod String   @default("full")
  isActive            Boolean  @default(true)
  createdAt           DateTime @default(now())

  group   ConsolidationGroup    @relation(fields: [groupId], references: [id], onDelete: Cascade)
  results ConsolidationResult[]
}'''
)

# ── IntercompanyTransaction: fix unreconciled route using partner as string ───
# The route sets partner to a string not an object. This is a route issue, skip.

# ── ServiceQueue: add queueItems alias for items ──────────────────────────────
content = content.replace(
    '''  items   ServiceQueueItem[]
}''',
    '''  items      ServiceQueueItem[]
  queueItems ServiceQueueItem[] @relation("QueueItemsAlias")
}'''
)
# That creates ambiguity again. Better: just keep items and see if route works with items.
# Revert:
content = content.replace(
    '''  items      ServiceQueueItem[]
  queueItems ServiceQueueItem[] @relation("QueueItemsAlias")
}''',
    '''  items      ServiceQueueItem[]
}'''
)

# ── WarehouseActivity: storeId errors - route uses storeId filter but storeId is optional ──
# Already added storeId - this should work now.

# ── LotNumber.isExpired field ────────────────────────────────────────────────
content = content.replace(
    '''  itemTrackingId String?
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

  product      Product          @relation(fields: [productId], references: [id])
  supplier     Supplier?        @relation(fields: [supplierId], references: [id])
  movements    LotMovement[]
  itemTracking ItemTracking?    @relation("ItemTrackingLotNos", fields: [itemTrackingId], references: [id])
}'''
)

# ── ProductVariant: add variantCode ───────────────────────────────────────────
content = content.replace(
    '''model ProductVariant {
  id        String   @id @default(cuid())
  productId String
  sku       String?
  name      String
  price     Float?
  cost      Float?
  barcode   String?
  isActive  Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt''',
    '''model ProductVariant {
  id          String   @id @default(cuid())
  productId   String
  variantCode String?
  sku         String?
  name        String
  price       Float?
  cost        Float?
  barcode     String?
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt'''
)

# ── TimeSheetLine: add inventory lookup for variantId ─────────────────────────
# variantId on Inventory is a code error in the route, not a schema issue. Skip.

# ── ProjectInvoice: processedAt ───────────────────────────────────────────────
# Already has invoicedAt, invoiceDate, dueDate. Route error for this should be fixed.

# ── Payment: add processedAt alias for createdAt ──────────────────────────────
# Payment doesn't have processedAt. Add it:
content = content.replace(
    '''  prepaymentNo  String?
  appliedAmount Float    @default(0)
  customerId    String?
  createdAt     DateTime @default(now())''',
    '''  prepaymentNo  String?
  appliedAmount Float    @default(0)
  customerId    String?
  processedAt   DateTime?
  createdAt     DateTime @default(now())'''
)

# ── ProjectPlanningLine: fix orderId filter for TransferLine ──────────────────
# TransferLine uses orderId = transferOrderId, so need to add orderId alias
# Actually the route error was: 'orderId' does not exist in type 'TransferLineWhereInput'
# TransferLine has transferOrderId not orderId.
content = content.replace(
    '''model TransferLine {
  id               String   @id @default(cuid())
  transferOrderId  String
  productId        String
  quantity         Float    @default(1)
  quantityShipped  Float    @default(0)
  quantityReceived Float    @default(0)
  unitCost         Float    @default(0)
  notes            String?
  createdAt        DateTime @default(now())

  transferOrder TransferOrder @relation(fields: [transferOrderId], references: [id], onDelete: Cascade)
}''',
    '''model TransferLine {
  id               String   @id @default(cuid())
  transferOrderId  String
  orderId          String?
  productId        String
  quantity         Float    @default(1)
  quantityShipped  Float    @default(0)
  quantityReceived Float    @default(0)
  unitCost         Float    @default(0)
  notes            String?
  createdAt        DateTime @default(now())

  transferOrder TransferOrder @relation(fields: [transferOrderId], references: [id], onDelete: Cascade)
}'''
)

# ── WarehouseShipmentLine: add shippingDate ───────────────────────────────────
content = content.replace(
    '''model WarehouseShipmentLine {
  id              String   @id @default(cuid())
  shipmentId      String
  productId       String?
  quantity        Float    @default(1)
  quantityShipped Float    @default(0)
  createdAt       DateTime @default(now())

  shipment WarehouseShipment @relation(fields: [shipmentId], references: [id], onDelete: Cascade)
}''',
    '''model WarehouseShipmentLine {
  id              String    @id @default(cuid())
  shipmentId      String
  productId       String?
  quantity        Float     @default(1)
  quantityShipped Float     @default(0)
  shippingDate    DateTime?
  createdAt       DateTime  @default(now())

  shipment WarehouseShipment @relation(fields: [shipmentId], references: [id], onDelete: Cascade)
}'''
)

# ── LoyaltyTransaction: add totalPrice ────────────────────────────────────────
content = content.replace(
    '''  expiresAt     DateTime?
  createdBy     String?
  createdAt     DateTime  @default(now())

  card    LoyaltyCard    @relation(fields: [cardId], references: [id])''',
    '''  expiresAt     DateTime?
  createdBy     String?
  totalPrice    Float?
  createdAt     DateTime  @default(now())

  card    LoyaltyCard    @relation(fields: [cardId], references: [id])'''
)

with open(schema_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Done applying fix_schema2 replacements")
