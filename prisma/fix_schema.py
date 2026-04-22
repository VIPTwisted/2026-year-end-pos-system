import re

schema_path = 'C:/Users/DeMar/Desktop/2026-year-end-pos/prisma/schema.prisma'
with open(schema_path, 'r', encoding='utf-8') as f:
    content = f.read()

# ── ConversationMessage: add sender field ──────────────────────────────────────
content = content.replace(
    '''model ConversationMessage {
  id             String      @id @default(cuid())
  conversationId String
  direction      String      @default("inbound")
  content        String
  channel        String?
  sentAt         DateTime    @default(now())
  createdAt      DateTime    @default(now())''',
    '''model ConversationMessage {
  id             String      @id @default(cuid())
  conversationId String
  direction      String      @default("inbound")
  content        String
  channel        String?
  sender         String?
  sentAt         DateTime    @default(now())
  createdAt      DateTime    @default(now())'''
)

# ── ConversationTransfer: add fromAgentName ────────────────────────────────────
content = content.replace(
    '''model ConversationTransfer {
  id             String      @id @default(cuid())
  conversationId String
  fromAgentId    String?
  toAgentId      String?
  reason         String?
  transferredAt  DateTime    @default(now())
  createdAt      DateTime    @default(now())''',
    '''model ConversationTransfer {
  id             String      @id @default(cuid())
  conversationId String
  fromAgentId    String?
  toAgentId      String?
  fromAgentName  String?
  toAgentName    String?
  reason         String?
  transferredAt  DateTime    @default(now())
  createdAt      DateTime    @default(now())'''
)

# ── NumberSeries: add missing fields, rename logs→usageLogs ──────────────────
content = content.replace(
    '''model NumberSeries {
  id            String   @id @default(cuid())
  code          String   @unique
  description   String?
  prefix        String   @default("")
  suffix        String   @default("")
  startNumber   Int      @default(1)
  currentNumber Int      @default(0)
  increment     Int      @default(1)
  minLength     Int      @default(6)
  isActive      Boolean  @default(true)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  logs NumberSeriesLog[]
}''',
    '''model NumberSeries {
  id            String   @id @default(cuid())
  code          String   @unique
  description   String?
  prefix        String   @default("")
  suffix        String   @default("")
  startNumber   Int      @default(1)
  startingNo    Int      @default(1)
  currentNumber Int      @default(0)
  lastNoUsed    Int      @default(0)
  endingNo      Int?
  increment     Int      @default(1)
  incrementBy   Int      @default(1)
  minLength     Int      @default(6)
  paddingLength Int      @default(6)
  isActive      Boolean  @default(true)
  isDefault     Boolean  @default(false)
  allowManual   Boolean  @default(true)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  usageLogs NumberSeriesLog[]
}'''
)

# ── NumberSeriesLog: add numberGenerated, usedBy, usedById ───────────────────
content = content.replace(
    '''model NumberSeriesLog {
  id       String   @id @default(cuid())
  seriesId String
  number   Int
  usedFor  String?
  usedAt   DateTime @default(now())

  series NumberSeries @relation(fields: [seriesId], references: [id], onDelete: Cascade)
}''',
    '''model NumberSeriesLog {
  id              String   @id @default(cuid())
  seriesId        String
  number          Int
  numberGenerated String?
  usedFor         String?
  usedBy          String?
  usedById        String?
  usedAt          DateTime @default(now())

  series NumberSeries @relation(fields: [seriesId], references: [id], onDelete: Cascade)
}'''
)

# ── SubcontractingOrder: add many fields + vendor relation + lines ────────────
content = content.replace(
    '''model SubcontractingOrder {
  id         String    @id @default(cuid())
  orderNo    String    @unique @default(cuid())
  supplierId String?
  productId  String?
  quantity   Float     @default(1)
  unitCost   Float     @default(0)
  dueDate    DateTime?
  status     String    @default("open")
  notes      String?
  createdAt  DateTime  @default(now())
  updatedAt  DateTime  @updatedAt
}''',
    '''model SubcontractingOrder {
  id                String    @id @default(cuid())
  orderNo           String    @unique @default(cuid())
  orderNumber       String    @unique @default(cuid())
  supplierId        String?
  vendorId          String?
  productId         String?
  productionOrderId String?
  workCenterId      String?
  operationNo       String?
  description       String    @default("")
  quantity          Float     @default(1)
  unitCost          Float     @default(0)
  totalCost         Float     @default(0)
  unitOfMeasure     String    @default("EACH")
  expectedDate      DateTime?
  dueDate           DateTime?
  status            String    @default("open")
  notes             String?
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt

  vendor Vendor? @relation(fields: [vendorId], references: [id])
  lines  SubcontractingOrderLine[]
}

model SubcontractingOrderLine {
  id            String  @id @default(cuid())
  orderId       String
  productId     String?
  quantity      Float   @default(1)
  unitOfMeasure String  @default("EACH")
  type          String  @default("component")

  order SubcontractingOrder @relation(fields: [orderId], references: [id], onDelete: Cascade)
}'''
)

# ── FAInsurance: add policyNo alias ──────────────────────────────────────────
content = content.replace(
    '''model FAInsurance {
  id           String    @id @default(cuid())
  assetId      String
  provider     String
  policyNumber String?
  coverage     Float     @default(0)
  premium      Float     @default(0)
  startDate    DateTime?
  endDate      DateTime?
  notes        String?
  createdAt    DateTime  @default(now())

  asset FixedAsset @relation(fields: [assetId], references: [id], onDelete: Cascade)
}''',
    '''model FAInsurance {
  id           String    @id @default(cuid())
  assetId      String
  provider     String
  policyNumber String?
  policyNo     String?
  coverage     Float     @default(0)
  premium      Float     @default(0)
  startDate    DateTime?
  endDate      DateTime?
  notes        String?
  createdAt    DateTime  @default(now())

  asset FixedAsset @relation(fields: [assetId], references: [id], onDelete: Cascade)
}'''
)

# ── FAMaintenanceLedger: add serviceDate, maintenanceCode ────────────────────
content = content.replace(
    '''model FAMaintenanceLedger {
  id              String    @id @default(cuid())
  assetId         String
  maintenanceDate DateTime  @default(now())
  description     String
  cost            Float     @default(0)
  performedBy     String?
  nextDueDate     DateTime?
  createdAt       DateTime  @default(now())

  asset FixedAsset @relation(fields: [assetId], references: [id], onDelete: Cascade)
}''',
    '''model FAMaintenanceLedger {
  id              String    @id @default(cuid())
  assetId         String
  maintenanceDate DateTime  @default(now())
  serviceDate     DateTime?
  maintenanceCode String?
  description     String
  cost            Float     @default(0)
  performedBy     String?
  nextDueDate     DateTime?
  createdAt       DateTime  @default(now())

  asset FixedAsset @relation(fields: [assetId], references: [id], onDelete: Cascade)
}'''
)

# ── KitComponent: add sortOrder, isOptional, component relation ──────────────
content = content.replace(
    '''model KitComponent {
  id        String @id @default(cuid())
  kitId     String
  productId String
  quantity  Float  @default(1)

  kit ProductKit @relation(fields: [kitId], references: [id], onDelete: Cascade)
}''',
    '''model KitComponent {
  id         String  @id @default(cuid())
  kitId      String
  productId  String
  quantity   Float   @default(1)
  sortOrder  Int     @default(0)
  isOptional Boolean @default(false)

  kit       ProductKit @relation(fields: [kitId], references: [id], onDelete: Cascade)
  component Product    @relation("KitComponentProduct", fields: [productId], references: [id])
}'''
)

# ── BundleComponent: add product relation ─────────────────────────────────────
content = content.replace(
    '''model BundleComponent {
  id        String @id @default(cuid())
  bundleId  String
  productId String
  quantity  Float  @default(1)

  bundle ProductBundle @relation(fields: [bundleId], references: [id], onDelete: Cascade)
}''',
    '''model BundleComponent {
  id        String @id @default(cuid())
  bundleId  String
  productId String
  quantity  Float  @default(1)

  bundle  ProductBundle @relation(fields: [bundleId], references: [id], onDelete: Cascade)
  product Product       @relation("BundleComponentProduct", fields: [productId], references: [id])
}'''
)

# ── ProductBundle: add bundleType ─────────────────────────────────────────────
content = content.replace(
    '''model ProductBundle {
  id          String   @id @default(cuid())
  productId   String
  name        String
  description String?
  price       Float?
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  product    Product           @relation(fields: [productId], references: [id], onDelete: Cascade)
  components BundleComponent[]
}''',
    '''model ProductBundle {
  id          String   @id @default(cuid())
  productId   String
  name        String
  description String?
  price       Float?
  bundleType  String   @default("bundle")
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  product    Product           @relation(fields: [productId], references: [id], onDelete: Cascade)
  components BundleComponent[]
}'''
)

# ── ProductKit: add kitType ────────────────────────────────────────────────────
content = content.replace(
    '''model ProductKit {
  id          String   @id @default(cuid())
  productId   String
  name        String
  description String?
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())

  product    Product        @relation(fields: [productId], references: [id], onDelete: Cascade)
  components KitComponent[]
}''',
    '''model ProductKit {
  id          String   @id @default(cuid())
  productId   String
  name        String
  description String?
  kitType     String   @default("kit")
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())

  product    Product        @relation(fields: [productId], references: [id], onDelete: Cascade)
  components KitComponent[]
}'''
)

# ── Resource: add resourceNo ──────────────────────────────────────────────────
content = content.replace(
    '''model Resource {
  id            String   @id @default(cuid())
  name          String
  type          String   @default("labor")
  unitOfMeasure String   @default("hour")
  unitCost      Float    @default(0)
  isActive      Boolean  @default(true)
  notes         String?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}''',
    '''model Resource {
  id            String   @id @default(cuid())
  resourceNo    String?
  name          String
  type          String   @default("labor")
  unitOfMeasure String   @default("hour")
  unitCost      Float    @default(0)
  isActive      Boolean  @default(true)
  notes         String?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  timesheetLines TimeSheetLine[]
}'''
)

# ── BlanketSalesOrder: add orderNumber, customerId, storeId, store/customer relations ──
content = content.replace(
    '''model BlanketSalesOrder {
  id         String    @id @default(cuid())
  orderNo    String    @unique @default(cuid())
  customerId String?
  startDate  DateTime?
  endDate    DateTime?
  status     String    @default("open")
  notes      String?
  createdAt  DateTime  @default(now())
  updatedAt  DateTime  @updatedAt

  lines BlanketSalesLine[]
}''',
    '''model BlanketSalesOrder {
  id          String    @id @default(cuid())
  orderNo     String    @unique @default(cuid())
  orderNumber String    @unique @default(cuid())
  customerId  String?
  storeId     String?
  startDate   DateTime?
  endDate     DateTime?
  status      String    @default("open")
  notes       String?
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  customer Customer? @relation("BlanketSalesOrderCustomer", fields: [customerId], references: [id])
  store    Store?    @relation("BlanketSalesOrderStore", fields: [storeId], references: [id])
  lines    BlanketSalesLine[]
}'''
)

# ── BlanketSalesLine: add product relation, qtyOutstanding, qtyPicked ─────────
content = content.replace(
    '''model BlanketSalesLine {
  id         String   @id @default(cuid())
  orderId    String
  productId  String?
  quantity   Float    @default(1)
  unitPrice  Float    @default(0)
  qtyShipped Float    @default(0)
  notes      String?
  createdAt  DateTime @default(now())

  order BlanketSalesOrder @relation(fields: [orderId], references: [id], onDelete: Cascade)
}''',
    '''model BlanketSalesLine {
  id             String   @id @default(cuid())
  orderId        String
  productId      String?
  quantity       Float    @default(1)
  unitPrice      Float    @default(0)
  qtyShipped     Float    @default(0)
  qtyOutstanding Float    @default(0)
  qtyPicked      Float    @default(0)
  notes          String?
  createdAt      DateTime @default(now())

  order   BlanketSalesOrder @relation(fields: [orderId], references: [id], onDelete: Cascade)
  product Product?          @relation("BlanketSalesLineProduct", fields: [productId], references: [id])
}'''
)

# ── SLAPolicy: add isDefault, applicableTo ────────────────────────────────────
content = content.replace(
    '''model SLAPolicy {
  id          String   @id @default(cuid())
  name        String
  description String?
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  items SLAItem[]
}''',
    '''model SLAPolicy {
  id          String   @id @default(cuid())
  name        String
  description String?
  isActive    Boolean  @default(true)
  isDefault   Boolean  @default(false)
  applicableTo String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  items SLAItem[]
}'''
)

# ── SLAItem: add firstResponseDeadline, unique caseId, case relation ──────────
content = content.replace(
    '''model SLAItem {
  id             String    @id @default(cuid())
  policyId       String
  caseId         String?
  priority       String    @default("normal")
  responseTime   Int       @default(480)
  resolutionTime Int       @default(1440)
  breached       Boolean   @default(false)
  breachedAt     DateTime?
  createdAt      DateTime  @default(now())

  policy SLAPolicy @relation(fields: [policyId], references: [id], onDelete: Cascade)
}''',
    '''model SLAItem {
  id                    String    @id @default(cuid())
  policyId              String
  caseId                String?   @unique
  priority              String    @default("normal")
  responseTime          Int       @default(480)
  resolutionTime        Int       @default(1440)
  firstResponseDeadline DateTime?
  breached              Boolean   @default(false)
  breachedAt            DateTime?
  createdAt             DateTime  @default(now())

  policy SLAPolicy    @relation(fields: [policyId], references: [id], onDelete: Cascade)
  case   ServiceCase? @relation(fields: [caseId], references: [id])
}'''
)

# ── KnowledgeArticle: add articleNo, viewCount, helpfulCount, notHelpfulCount, keywords, summary ──
content = content.replace(
    '''model KnowledgeArticle {
  id         String   @id @default(cuid())
  title      String
  content    String
  category   String?
  tags       String?
  views      Int      @default(0)
  helpful    Int      @default(0)
  notHelpful Int      @default(0)
  status     String   @default("draft")
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
}''',
    '''model KnowledgeArticle {
  id             String   @id @default(cuid())
  articleNo      String?
  title          String
  content        String
  summary        String?
  category       String?
  tags           String?
  keywords       String?
  views          Int      @default(0)
  viewCount      Int      @default(0)
  helpful        Int      @default(0)
  helpfulCount   Int      @default(0)
  notHelpful     Int      @default(0)
  notHelpfulCount Int     @default(0)
  status         String   @default("draft")
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
}'''
)

# ── CaseSurvey: add sentAt, nps, unique caseId ────────────────────────────────
content = content.replace(
    '''model CaseSurvey {
  id          String    @id @default(cuid())
  caseId      String
  rating      Int?
  comment     String?
  respondedAt DateTime?
  createdAt   DateTime  @default(now())
}''',
    '''model CaseSurvey {
  id          String    @id @default(cuid())
  caseId      String    @unique
  rating      Int?
  nps         Int?
  comment     String?
  sentAt      DateTime?
  respondedAt DateTime?
  createdAt   DateTime  @default(now())
}'''
)

# ── ServiceContract: add contractNumber ───────────────────────────────────────
content = content.replace(
    '''model ServiceContract {
  id         String    @id @default(cuid())
  customerId String?
  name       String
  startDate  DateTime?
  endDate    DateTime?
  value      Float     @default(0)
  status     String    @default("active")
  notes      String?
  createdAt  DateTime  @default(now())
  updatedAt  DateTime  @updatedAt
}''',
    '''model ServiceContract {
  id             String    @id @default(cuid())
  contractNumber String?   @unique
  customerId     String?
  name           String
  startDate      DateTime?
  endDate        DateTime?
  value          Float     @default(0)
  status         String    @default("active")
  notes          String?
  createdAt      DateTime  @default(now())
  updatedAt      DateTime  @updatedAt
}'''
)

# ── Entitlement: add name ─────────────────────────────────────────────────────
content = content.replace(
    '''model Entitlement {
  id         String    @id @default(cuid())
  customerId String?
  productId  String?
  type       String    @default("warranty")
  startDate  DateTime?
  endDate    DateTime?
  status     String    @default("active")
  notes      String?
  createdAt  DateTime  @default(now())
  updatedAt  DateTime  @updatedAt
}''',
    '''model Entitlement {
  id         String    @id @default(cuid())
  customerId String?
  productId  String?
  name       String    @default("")
  type       String    @default("warranty")
  startDate  DateTime?
  endDate    DateTime?
  status     String    @default("active")
  notes      String?
  createdAt  DateTime  @default(now())
  updatedAt  DateTime  @updatedAt
}'''
)

# ── RetailStatement: add store relation, businessDate, totalReturns, totalPayments ──
content = content.replace(
    '''model RetailStatement {
  id          String    @id @default(cuid())
  storeId     String
  statementNo String    @unique @default(cuid())
  startDate   DateTime?
  endDate     DateTime?
  totalCash   Float     @default(0)
  totalCard   Float     @default(0)
  totalSales  Float     @default(0)
  status      String    @default("open")
  postedAt    DateTime?
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  tenderLines StatementTenderLine[]
}''',
    '''model RetailStatement {
  id            String    @id @default(cuid())
  storeId       String
  statementNo   String    @unique @default(cuid())
  businessDate  DateTime?
  startDate     DateTime?
  endDate       DateTime?
  totalCash     Float     @default(0)
  totalCard     Float     @default(0)
  totalSales    Float     @default(0)
  totalReturns  Float     @default(0)
  totalPayments Float     @default(0)
  status        String    @default("open")
  postedAt      DateTime?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  store       Store               @relation("RetailStatementStore", fields: [storeId], references: [id])
  tenderLines StatementTenderLine[]
}'''
)

# ── TimeSheet: add sheetNo, project relation ──────────────────────────────────
content = content.replace(
    '''model TimeSheet {
  id          String    @id @default(cuid())
  employeeId  String?
  periodStart DateTime?
  periodEnd   DateTime?
  status      String    @default("open")
  totalHours  Float     @default(0)
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  lines TimeSheetLine[]
}''',
    '''model TimeSheet {
  id          String    @id @default(cuid())
  sheetNo     String?
  employeeId  String?
  projectId   String?
  periodStart DateTime?
  periodEnd   DateTime?
  status      String    @default("open")
  totalHours  Float     @default(0)
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  project Project?      @relation("TimeSheetProject", fields: [projectId], references: [id])
  lines   TimeSheetLine[]
}'''
)

# ── TimeSheetLine: add date alias, projectId, resourceId, resource relation ────
content = content.replace(
    '''model TimeSheetLine {
  id          String   @id @default(cuid())
  sheetId     String
  workDate    DateTime @default(now())
  hours       Float    @default(0)
  description String?
  type        String   @default("regular")
  createdAt   DateTime @default(now())

  sheet TimeSheet @relation(fields: [sheetId], references: [id], onDelete: Cascade)
}''',
    '''model TimeSheetLine {
  id          String   @id @default(cuid())
  sheetId     String
  workDate    DateTime @default(now())
  date        DateTime @default(now())
  hours       Float    @default(0)
  description String?
  type        String   @default("regular")
  projectId   String?
  resourceId  String?
  createdAt   DateTime @default(now())

  sheet    TimeSheet @relation(fields: [sheetId], references: [id], onDelete: Cascade)
  resource Resource? @relation(fields: [resourceId], references: [id])
}'''
)

# ── TradeAgreement: add relation field ────────────────────────────────────────
content = content.replace(
    '''model TradeAgreement {
  id          String    @id @default(cuid())
  name        String
  type        String    @default("price")
  customerId  String?
  supplierId  String?
  productId   String?
  startDate   DateTime?
  endDate     DateTime?
  discountPct Float     @default(0)
  price       Float?
  isActive    Boolean   @default(true)
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}''',
    '''model TradeAgreement {
  id          String    @id @default(cuid())
  name        String
  type        String    @default("price")
  relation    String?
  customerId  String?
  supplierId  String?
  productId   String?
  startDate   DateTime?
  endDate     DateTime?
  discountPct Float     @default(0)
  price       Float?
  isActive    Boolean   @default(true)
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}'''
)

# ── WarehouseActivity: add activityNo, storeId, store relation, receiptId, shipmentId ──
content = content.replace(
    '''model WarehouseActivity {
  id         String    @id @default(cuid())
  type       String    @default("pick")
  status     String    @default("open")
  assignedTo String?
  sourceNo   String?
  dueDate    DateTime?
  createdAt  DateTime  @default(now())
  updatedAt  DateTime  @updatedAt

  lines WarehouseActivityLine[]
}''',
    '''model WarehouseActivity {
  id         String    @id @default(cuid())
  activityNo String?
  type       String    @default("pick")
  status     String    @default("open")
  assignedTo String?
  sourceNo   String?
  storeId    String?
  receiptId  String?
  shipmentId String?
  dueDate    DateTime?
  createdAt  DateTime  @default(now())
  updatedAt  DateTime  @updatedAt

  store Store?                 @relation("WarehouseActivityStore", fields: [storeId], references: [id])
  lines WarehouseActivityLine[]
}'''
)

# ── WarehouseActivityLine: add lineNo, actionType, binId, unitOfMeasure, lotNo, serialNo, qtyHandled, product ──
content = content.replace(
    '''model WarehouseActivityLine {
  id              String   @id @default(cuid())
  activityId      String
  productId       String?
  fromBinId       String?
  toBinId         String?
  quantity        Float    @default(1)
  quantityHandled Float    @default(0)
  createdAt       DateTime @default(now())

  activity WarehouseActivity @relation(fields: [activityId], references: [id], onDelete: Cascade)
}''',
    '''model WarehouseActivityLine {
  id              String   @id @default(cuid())
  activityId      String
  lineNo          Int      @default(0)
  actionType      String   @default("pick")
  productId       String?
  binId           String?
  fromBinId       String?
  toBinId         String?
  quantity        Float    @default(1)
  quantityHandled Float    @default(0)
  qtyHandled      Float    @default(0)
  unitOfMeasure   String   @default("EACH")
  lotNo           String?
  serialNo        String?
  createdAt       DateTime @default(now())

  activity WarehouseActivity @relation(fields: [activityId], references: [id], onDelete: Cascade)
  product  Product?          @relation("WarehouseActivityLineProduct", fields: [productId], references: [id])
}'''
)

# ── ProjectPlanningLine: add taskId, productId, product relation, lineAmount, isTransferred ──
content = content.replace(
    '''model ProjectPlanningLine {
  id          String    @id @default(cuid())
  projectId   String
  description String
  type        String    @default("resource")
  quantity    Float     @default(1)
  unitCost    Float     @default(0)
  unitPrice   Float     @default(0)
  plannedDate DateTime?
  status      String    @default("open")
  createdAt   DateTime  @default(now())

  project Project @relation(fields: [projectId], references: [id], onDelete: Cascade)
}''',
    '''model ProjectPlanningLine {
  id            String    @id @default(cuid())
  projectId     String
  taskId        String?
  productId     String?
  description   String
  type          String    @default("resource")
  quantity      Float     @default(1)
  unitCost      Float     @default(0)
  unitPrice     Float     @default(0)
  lineAmount    Float     @default(0)
  plannedDate   DateTime?
  status        String    @default("open")
  isTransferred Boolean   @default(false)
  createdAt     DateTime  @default(now())

  project Project  @relation(fields: [projectId], references: [id], onDelete: Cascade)
  product Product? @relation("ProjectPlanningLineProduct", fields: [productId], references: [id])
}'''
)

# ── ProjectInvoice: add dueDate, invoiceDate ──────────────────────────────────
content = content.replace(
    '''model ProjectInvoice {
  id         String    @id @default(cuid())
  projectId  String
  invoiceNo  String    @unique @default(cuid())
  amount     Float     @default(0)
  status     String    @default("draft")
  invoicedAt DateTime?
  createdAt  DateTime  @default(now())

  project Project @relation(fields: [projectId], references: [id], onDelete: Cascade)
}''',
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
}'''
)

with open(schema_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Done applying all replacements")
