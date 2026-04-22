#!/usr/bin/env python3
"""Append Project Operations models to schema.prisma"""

SCHEMA_ADDITION = r"""

// ================================================================================
// PROJECT OPERATIONS — D365 Project Operations Clone
// ================================================================================

model Project {
  id             String    @id @default(cuid())
  projectNo      String    @unique
  description    String
  customerId     String?
  status         String    @default("planning")
  startDate      DateTime?
  endDate        DateTime?
  dueDate        DateTime?
  contractAmount Float     @default(0)
  budgetAmount   Float     @default(0)
  wipMethod      String    @default("completed_contract")
  notes          String?
  createdAt      DateTime  @default(now())
  updatedAt      DateTime  @updatedAt

  customer      Customer?            @relation(fields: [customerId], references: [id])
  tasks         ProjectTask[]
  planningLines ProjectPlanLine[]
  ledgerEntries ProjectLedgerEntry[]
  invoices      ProjectInvoice[]
  timesheets    TimeSheet[]
  budgetLines   ProjectBudgetLine[]
  actuals       ProjectActual[]
}

model ProjectTask {
  id          String    @id @default(cuid())
  projectId   String
  taskNo      String
  description String
  taskType    String    @default("task")
  indentation Int       @default(0)
  sortOrder   Int       @default(0)
  budgetHours Float     @default(0)
  actualHours Float     @default(0)
  status      String    @default("open")
  startDate   DateTime?
  endDate     DateTime?
  createdAt   DateTime  @default(now())

  project        Project         @relation(fields: [projectId], references: [id], onDelete: Cascade)
  timesheetLines TimeSheetLine[]
}

model ProjectPlanLine {
  id            String    @id @default(cuid())
  projectId     String
  taskId        String?
  description   String
  lineType      String    @default("resource")
  productId     String?
  quantity      Float     @default(1)
  unitCost      Float     @default(0)
  unitPrice     Float     @default(0)
  lineAmount    Float     @default(0)
  plannedDate   DateTime?
  isTransferred Boolean   @default(false)
  isBillable    Boolean   @default(true)
  createdAt     DateTime  @default(now())

  project Project  @relation(fields: [projectId], references: [id], onDelete: Cascade)
  product Product? @relation(fields: [productId], references: [id])
}

model ProjectLedgerEntry {
  id          String    @id @default(cuid())
  projectId   String
  taskId      String?
  entryType   String    @default("resource")
  postingDate DateTime?
  description String
  quantity    Float     @default(1)
  unitCost    Float     @default(0)
  unitPrice   Float     @default(0)
  totalCost   Float     @default(0)
  totalPrice  Float     @default(0)
  isBillable  Boolean   @default(true)
  isInvoiced  Boolean   @default(false)
  createdAt   DateTime  @default(now())

  project Project @relation(fields: [projectId], references: [id], onDelete: Cascade)
}

model ProjectInvoice {
  id          String    @id @default(cuid())
  projectId   String
  invoiceNo   String    @unique
  invoiceDate DateTime?
  dueDate     DateTime?
  amount      Float     @default(0)
  vatAmount   Float     @default(0)
  status      String    @default("draft")
  notes       String?
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  project Project @relation(fields: [projectId], references: [id], onDelete: Cascade)
}

model ProjectActual {
  id          String   @id @default(cuid())
  projectId   String
  taskId      String?
  type        String   @default("cost")
  amount      Float    @default(0)
  hours       Float    @default(0)
  resourceId  String?
  description String?
  date        DateTime @default(now())
  createdAt   DateTime @default(now())

  project  Project   @relation(fields: [projectId], references: [id], onDelete: Cascade)
  resource Resource? @relation(fields: [resourceId], references: [id])
}

model ProjectBudgetLine {
  id           String   @id @default(cuid())
  projectId    String
  taskId       String?
  lineType     String   @default("time")
  description  String
  quantity     Float    @default(0)
  unitAmount   Float    @default(0)
  budgetAmount Float    @default(0)
  period       String?
  createdAt    DateTime @default(now())

  project Project @relation(fields: [projectId], references: [id], onDelete: Cascade)
}

model Resource {
  id            String   @id @default(cuid())
  resourceNo    String   @unique
  name          String
  type          String   @default("labor")
  unitOfMeasure String   @default("hour")
  unitCost      Float    @default(0)
  unitPrice     Float    @default(0)
  capacity      Float    @default(8)
  isActive      Boolean  @default(true)
  notes         String?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  timesheets     TimeSheet[]
  timesheetLines TimeSheetLine[]
  actuals        ProjectActual[]
  skills         ResourceSkill[]
  bookings       ResourceBooking[]
}

model ResourceSkill {
  id          String   @id @default(cuid())
  resourceId  String
  skillName   String
  proficiency String   @default("basic")
  createdAt   DateTime @default(now())

  resource Resource @relation(fields: [resourceId], references: [id], onDelete: Cascade)
}

model ResourceBooking {
  id         String   @id @default(cuid())
  resourceId String
  projectId  String?
  startDate  DateTime
  endDate    DateTime
  hours      Float    @default(0)
  status     String   @default("soft")
  notes      String?
  createdAt  DateTime @default(now())

  resource Resource @relation(fields: [resourceId], references: [id])
}

model TimeSheet {
  id         String   @id @default(cuid())
  sheetNo    String   @unique
  resourceId String?
  employeeId String?
  projectId  String?
  startDate  DateTime
  endDate    DateTime
  status     String   @default("open")
  totalHours Float    @default(0)
  notes      String?
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt

  resource Resource? @relation(fields: [resourceId], references: [id])
  project  Project?  @relation(fields: [projectId], references: [id])
  lines    TimeSheetLine[]
}

model TimeSheetLine {
  id          String   @id @default(cuid())
  sheetId     String
  projectId   String?
  taskId      String?
  resourceId  String?
  date        DateTime @default(now())
  hours       Float    @default(0)
  description String?
  type        String   @default("regular")
  isBillable  Boolean  @default(true)
  status      String   @default("open")
  notes       String?
  createdAt   DateTime @default(now())

  sheet    TimeSheet    @relation(fields: [sheetId], references: [id], onDelete: Cascade)
  task     ProjectTask? @relation(fields: [taskId], references: [id])
  resource Resource?    @relation(fields: [resourceId], references: [id])
}

model ExpenseCategory {
  id          String   @id @default(cuid())
  name        String   @unique
  description String?
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())

  reports ExpenseReport[]
}

model ExpenseReport {
  id          String    @id @default(cuid())
  reportNo    String    @unique
  employeeId  String?
  projectId   String?
  categoryId  String?
  title       String
  status      String    @default("draft")
  totalAmount Float     @default(0)
  notes       String?
  submittedAt DateTime?
  approvedAt  DateTime?
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  category ExpenseCategory? @relation(fields: [categoryId], references: [id])
  lines    ExpenseLine[]
}

model ExpenseLine {
  id           String   @id @default(cuid())
  reportId     String
  expenseDate  DateTime @default(now())
  description  String
  categoryName String?
  amount       Float    @default(0)
  currency     String   @default("USD")
  receiptRef   String?
  isBillable   Boolean  @default(true)
  projectId    String?
  createdAt    DateTime @default(now())

  report ExpenseReport @relation(fields: [reportId], references: [id], onDelete: Cascade)
}

model Contract {
  id         String    @id @default(cuid())
  contractNo String    @unique
  title      String
  type       String    @default("project")
  customerId String?
  supplierId String?
  status     String    @default("draft")
  startDate  DateTime?
  endDate    DateTime?
  value      Float     @default(0)
  currency   String    @default("USD")
  autoRenew  Boolean   @default(false)
  renewDays  Int       @default(30)
  terms      String?
  notes      String?
  createdAt  DateTime  @default(now())
  updatedAt  DateTime  @updatedAt

  customer Customer?  @relation(fields: [customerId], references: [id])
  supplier Supplier?  @relation(fields: [supplierId], references: [id])
  lines    ContractLine[]
}

model ContractLine {
  id          String   @id @default(cuid())
  contractId  String
  description String
  lineType    String   @default("service")
  unitPrice   Float    @default(0)
  quantity    Float    @default(1)
  lineTotal   Float    @default(0)
  sortOrder   Int      @default(0)
  createdAt   DateTime @default(now())

  contract Contract @relation(fields: [contractId], references: [id], onDelete: Cascade)
}

model ApprovalWorkflow {
  id          String   @id @default(cuid())
  name        String
  entityType  String
  description String?
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  steps    ApprovalWorkflowStep[]
  requests ApprovalRequest[]
}

model ApprovalWorkflowStep {
  id           String   @id @default(cuid())
  workflowId   String
  stepOrder    Int      @default(1)
  stepName     String
  approverRole String?
  approverType String   @default("role")
  isRequired   Boolean  @default(true)
  createdAt    DateTime @default(now())

  workflow ApprovalWorkflow @relation(fields: [workflowId], references: [id], onDelete: Cascade)
}

model ApprovalRequest {
  id          String    @id @default(cuid())
  workflowId  String
  entityType  String
  entityId    String
  entityRef   String
  requestedBy String
  status      String    @default("pending")
  notes       String?
  resolvedAt  DateTime?
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  workflow ApprovalWorkflow @relation(fields: [workflowId], references: [id])
  actions  ApprovalAction[]
}

model ApprovalAction {
  id        String   @id @default(cuid())
  requestId String
  action    String
  actorName String
  notes     String?
  createdAt DateTime @default(now())

  request ApprovalRequest @relation(fields: [requestId], references: [id], onDelete: Cascade)
}
"""

with open('C:/Users/DeMar/Desktop/2026-year-end-pos/prisma/schema.prisma', 'a', encoding='utf-8') as f:
    f.write(SCHEMA_ADDITION)
print('Schema extended with Project Operations models')
