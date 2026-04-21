import { PrismaClient } from '@prisma/client'
import { PrismaLibSql } from '@prisma/adapter-libsql'

const adapter = new PrismaLibSql({ url: 'file:prisma/dev.db' })
const prisma = new PrismaClient({ adapter })

async function main() {
  // ─── Stores ─────────────────────────────────────────────────────────────────
  const storeMain = await prisma.store.upsert({
    where: { id: 'store-main' },
    update: {},
    create: {
      id: 'store-main',
      name: 'Main Street Store',
      address: '123 Main St',
      city: 'Austin',
      state: 'TX',
      zip: '78701',
      phone: '512-555-0100',
      email: 'main@store.local',
      taxRate: 0.0825,
    },
  })

  const storeNorth = await prisma.store.upsert({
    where: { id: 'store-north' },
    update: {},
    create: {
      id: 'store-north',
      name: 'North Side Location',
      address: '800 North Loop Blvd',
      city: 'Austin',
      state: 'TX',
      zip: '78751',
      phone: '512-555-0200',
      email: 'north@store.local',
      taxRate: 0.0825,
    },
  })
  console.log('Stores:', storeMain.name, '|', storeNorth.name)

  // ─── Users ───────────────────────────────────────────────────────────────────
  const userAdmin = await prisma.user.upsert({
    where: { id: 'user-admin' },
    update: {},
    create: {
      id: 'user-admin',
      email: 'admin@store.local',
      name: 'Admin User',
      role: 'admin',
      passwordHash: 'hashed_admin_pw',
    },
  })

  const userCashier = await prisma.user.upsert({
    where: { id: 'user-cashier' },
    update: {},
    create: {
      id: 'user-cashier',
      email: 'cashier@store.local',
      name: 'Jane Doe',
      role: 'cashier',
      passwordHash: 'hashed_cashier_pw',
    },
  })

  const userEmp3 = await prisma.user.upsert({
    where: { id: 'user-emp3' },
    update: {},
    create: {
      id: 'user-emp3',
      email: 'emp3@store.local',
      name: 'Carlos Rodriguez',
      role: 'cashier',
      passwordHash: 'hashed_emp3_pw',
    },
  })
  console.log('Users:', userAdmin.name, '|', userCashier.name, '|', userEmp3.name)

  // ─── Employees ───────────────────────────────────────────────────────────────
  const emp001 = await prisma.employee.upsert({
    where: { id: 'emp-001' },
    update: {},
    create: {
      id: 'emp-001',
      userId: userAdmin.id,
      storeId: storeMain.id,
      firstName: 'Marcus',
      lastName: 'Thompson',
      position: 'Store Manager',
      department: 'Management',
      hourlyRate: 28.50,
    },
  })

  const emp002 = await prisma.employee.upsert({
    where: { id: 'emp-002' },
    update: {},
    create: {
      id: 'emp-002',
      userId: userCashier.id,
      storeId: storeMain.id,
      firstName: 'Sarah',
      lastName: 'Chen',
      position: 'Senior Cashier',
      department: 'Sales',
      hourlyRate: 16.75,
    },
  })

  const emp003 = await prisma.employee.upsert({
    where: { id: 'emp-003' },
    update: {},
    create: {
      id: 'emp-003',
      userId: userEmp3.id,
      storeId: storeNorth.id,
      firstName: 'Carlos',
      lastName: 'Rodriguez',
      position: 'Cashier',
      department: 'Sales',
      hourlyRate: 15.50,
    },
  })
  console.log('Employees:', emp001.firstName, '|', emp002.firstName, '|', emp003.firstName)

  // ─── Shifts ──────────────────────────────────────────────────────────────────
  await prisma.shift.upsert({
    where: { id: 'shift-001' },
    update: {},
    create: {
      id: 'shift-001',
      employeeId: emp001.id,
      storeId: storeMain.id,
      startTime: new Date('2026-04-21T08:00:00Z'),
      endTime: new Date('2026-04-21T16:00:00Z'),
      status: 'completed',
    },
  })

  await prisma.shift.upsert({
    where: { id: 'shift-002' },
    update: {},
    create: {
      id: 'shift-002',
      employeeId: emp002.id,
      storeId: storeMain.id,
      startTime: new Date('2026-04-21T14:00:00Z'),
      endTime: new Date('2026-04-21T22:00:00Z'),
      status: 'in_progress',
    },
  })

  await prisma.shift.upsert({
    where: { id: 'shift-003' },
    update: {},
    create: {
      id: 'shift-003',
      employeeId: emp003.id,
      storeId: storeNorth.id,
      startTime: new Date('2026-04-22T08:00:00Z'),
      endTime: new Date('2026-04-22T16:00:00Z'),
      status: 'scheduled',
    },
  })

  await prisma.shift.upsert({
    where: { id: 'shift-004' },
    update: {},
    create: {
      id: 'shift-004',
      employeeId: emp001.id,
      storeId: storeMain.id,
      startTime: new Date('2026-04-22T08:00:00Z'),
      endTime: new Date('2026-04-22T16:00:00Z'),
      status: 'scheduled',
    },
  })
  console.log('Shifts: 4 seeded')

  // ─── Categories ──────────────────────────────────────────────────────────────
  const cats = await Promise.all([
    prisma.productCategory.upsert({ where: { slug: 'beverages' }, update: {}, create: { name: 'Beverages', slug: 'beverages', color: '#3b82f6' } }),
    prisma.productCategory.upsert({ where: { slug: 'snacks' }, update: {}, create: { name: 'Snacks', slug: 'snacks', color: '#f59e0b' } }),
    prisma.productCategory.upsert({ where: { slug: 'electronics' }, update: {}, create: { name: 'Electronics', slug: 'electronics', color: '#8b5cf6' } }),
    prisma.productCategory.upsert({ where: { slug: 'clothing' }, update: {}, create: { name: 'Clothing', slug: 'clothing', color: '#ec4899' } }),
  ])
  const [catBev, catSnk, catElc] = cats
  console.log('Categories:', cats.map(c => c.name).join(', '))

  // ─── Suppliers ───────────────────────────────────────────────────────────────
  const sup001 = await prisma.supplier.upsert({
    where: { id: 'sup-001' },
    update: {},
    create: {
      id: 'sup-001',
      name: 'TechSource Inc',
      contactName: 'Dave Wilson',
      email: 'dave@techsource.local',
      phone: '800-555-0301',
      paymentTerms: 'Net 30',
    },
  })

  const sup002 = await prisma.supplier.upsert({
    where: { id: 'sup-002' },
    update: {},
    create: {
      id: 'sup-002',
      name: 'Pantry Direct LLC',
      contactName: 'Maria Santos',
      email: 'maria@pantry.local',
      phone: '800-555-0302',
      paymentTerms: 'Net 15',
    },
  })
  console.log('Suppliers:', sup001.name, '|', sup002.name)

  // ─── Products (8 existing + 4 new) ───────────────────────────────────────────
  const products = await Promise.all([
    // existing 8 — upsert with update: {} to leave them unchanged
    prisma.product.upsert({ where: { sku: 'BEV-001' }, update: {}, create: { sku: 'BEV-001', name: 'Premium Coffee', categoryId: catBev.id, costPrice: 1.25, salePrice: 4.99, unit: 'cup', reorderPoint: 10, reorderQty: 50 } }),
    prisma.product.upsert({ where: { sku: 'BEV-002' }, update: {}, create: { sku: 'BEV-002', name: 'Green Tea', categoryId: catBev.id, costPrice: 0.75, salePrice: 3.49, unit: 'cup', reorderPoint: 8, reorderQty: 40 } }),
    prisma.product.upsert({ where: { sku: 'SNK-001' }, update: {}, create: { sku: 'SNK-001', name: 'Artisan Crackers', categoryId: catSnk.id, costPrice: 1.50, salePrice: 5.99, unit: 'pack', reorderPoint: 5, reorderQty: 25 } }),
    prisma.product.upsert({ where: { sku: 'SNK-002' }, update: {}, create: { sku: 'SNK-002', name: 'Trail Mix', categoryId: catSnk.id, costPrice: 2.00, salePrice: 7.99, unit: 'bag', reorderPoint: 5, reorderQty: 20 } }),
    prisma.product.upsert({ where: { sku: 'ELC-001' }, update: {}, create: { sku: 'ELC-001', name: 'USB-C Cable 3ft', categoryId: catElc.id, costPrice: 3.00, salePrice: 14.99, unit: 'each', reorderPoint: 10, reorderQty: 30, supplierId: sup001.id } }),
    prisma.product.upsert({ where: { sku: 'ELC-002' }, update: {}, create: { sku: 'ELC-002', name: 'Wireless Earbuds', categoryId: catElc.id, costPrice: 25.00, salePrice: 79.99, unit: 'each', reorderPoint: 5, reorderQty: 15, supplierId: sup001.id } }),
    prisma.product.upsert({ where: { sku: 'CLT-001' }, update: {}, create: { sku: 'CLT-001', name: 'Logo Tee Shirt', categoryId: cats[3].id, costPrice: 8.00, salePrice: 24.99, unit: 'each', reorderPoint: 10, reorderQty: 25 } }),
    prisma.product.upsert({ where: { sku: 'CLT-002' }, update: {}, create: { sku: 'CLT-002', name: 'Hoodie Premium', categoryId: cats[3].id, costPrice: 22.00, salePrice: 59.99, unit: 'each', reorderPoint: 5, reorderQty: 15 } }),
    // 4 new products
    prisma.product.upsert({ where: { sku: 'ELC-003' }, update: {}, create: { sku: 'ELC-003', name: 'Bluetooth Speaker', categoryId: catElc.id, costPrice: 18.00, salePrice: 49.99, unit: 'each', reorderPoint: 3, reorderQty: 10, supplierId: sup001.id } }),
    prisma.product.upsert({ where: { sku: 'ELC-004' }, update: {}, create: { sku: 'ELC-004', name: 'Phone Stand', categoryId: catElc.id, costPrice: 4.00, salePrice: 12.99, unit: 'each', reorderPoint: 10, reorderQty: 30, supplierId: sup001.id } }),
    prisma.product.upsert({ where: { sku: 'SNK-003' }, update: {}, create: { sku: 'SNK-003', name: 'Organic Granola Bar', categoryId: catSnk.id, costPrice: 1.20, salePrice: 3.99, unit: 'each', reorderPoint: 15, reorderQty: 60, supplierId: sup002.id } }),
    prisma.product.upsert({ where: { sku: 'BEV-003' }, update: {}, create: { sku: 'BEV-003', name: 'Cold Brew Coffee', categoryId: catBev.id, costPrice: 1.50, salePrice: 5.49, unit: 'each', reorderPoint: 8, reorderQty: 40 } }),
  ])
  console.log('Products:', products.length)

  // Build a SKU → product lookup for use below
  const prodBySku = Object.fromEntries(products.map(p => [p.sku, p]))

  // ─── Inventory ───────────────────────────────────────────────────────────────
  const inventoryQtys: Record<string, number> = {
    'BEV-001': 42, 'BEV-002': 38, 'BEV-003': 20,
    'SNK-001': 27, 'SNK-002': 18, 'SNK-003': 55,
    'ELC-001': 35, 'ELC-002': 12, 'ELC-003': 8, 'ELC-004': 22,
    'CLT-001': 30, 'CLT-002': 14,
  }
  for (const product of products) {
    await prisma.inventory.upsert({
      where: { productId_storeId: { productId: product.id, storeId: storeMain.id } },
      update: {},
      create: {
        productId: product.id,
        storeId: storeMain.id,
        quantity: inventoryQtys[product.sku] ?? 20,
        reserved: 0,
      },
    })
  }
  console.log('Inventory seeded')

  // ─── Customers ───────────────────────────────────────────────────────────────
  const customers = await Promise.all([
    prisma.customer.upsert({ where: { email: 'alice@example.com' }, update: {}, create: { firstName: 'Alice', lastName: 'Johnson', email: 'alice@example.com', phone: '512-555-0201', city: 'Austin', state: 'TX', loyaltyPoints: 250, totalSpent: 487.50, visitCount: 12 } }),
    prisma.customer.upsert({ where: { email: 'bob@example.com' }, update: {}, create: { firstName: 'Bob', lastName: 'Martinez', email: 'bob@example.com', phone: '512-555-0202', city: 'Austin', state: 'TX', loyaltyPoints: 85, totalSpent: 124.99, visitCount: 4 } }),
    prisma.customer.upsert({ where: { email: 'carol@example.com' }, update: {}, create: { firstName: 'Carol', lastName: 'Smith', email: 'carol@example.com', phone: '512-555-0203', city: 'Round Rock', state: 'TX', loyaltyPoints: 1200, totalSpent: 2340.00, visitCount: 45 } }),
  ])
  const [alice, bob, carol] = customers
  console.log('Customers:', customers.length)

  // ─── Purchase Orders ─────────────────────────────────────────────────────────
  const po1 = await prisma.purchaseOrder.upsert({
    where: { poNumber: 'PO-SEED-001' },
    update: {},
    create: {
      id: 'po-seed-001',
      poNumber: 'PO-SEED-001',
      supplierId: sup001.id,
      storeId: storeMain.id,
      status: 'received',
      totalAmount: 490.00,
      expectedDate: new Date('2026-04-15T00:00:00Z'),
      receivedDate: new Date('2026-04-18T00:00:00Z'),
    },
  })

  const po2 = await prisma.purchaseOrder.upsert({
    where: { poNumber: 'PO-SEED-002' },
    update: {},
    create: {
      id: 'po-seed-002',
      poNumber: 'PO-SEED-002',
      supplierId: sup002.id,
      storeId: storeMain.id,
      status: 'sent',
      totalAmount: 155.00,
      expectedDate: new Date('2026-04-25T00:00:00Z'),
    },
  })

  // PO items — no unique key, so delete-then-create for idempotency
  try {
    await prisma.purchaseOrderItem.deleteMany({ where: { poId: po1.id } })
    await prisma.purchaseOrderItem.createMany({
      data: [
        { poId: po1.id, productId: prodBySku['ELC-001'].id, productName: 'USB-C Cable 3ft', sku: 'ELC-001', orderedQty: 20, receivedQty: 20, unitCost: 3.00, lineTotal: 60.00 },
        { poId: po1.id, productId: prodBySku['ELC-002'].id, productName: 'Wireless Earbuds', sku: 'ELC-002', orderedQty: 10, receivedQty: 10, unitCost: 25.00, lineTotal: 250.00 },
        { poId: po1.id, productId: prodBySku['ELC-003'].id, productName: 'Bluetooth Speaker', sku: 'ELC-003', orderedQty: 10, receivedQty: 10, unitCost: 18.00, lineTotal: 180.00 },
      ],
    })
  } catch (e) {
    console.error('PO-SEED-001 items error:', e)
  }

  try {
    await prisma.purchaseOrderItem.deleteMany({ where: { poId: po2.id } })
    await prisma.purchaseOrderItem.createMany({
      data: [
        { poId: po2.id, productId: prodBySku['SNK-001'].id, productName: 'Artisan Crackers', sku: 'SNK-001', orderedQty: 30, receivedQty: 0, unitCost: 1.50, lineTotal: 45.00 },
        { poId: po2.id, productId: prodBySku['SNK-002'].id, productName: 'Trail Mix', sku: 'SNK-002', orderedQty: 25, receivedQty: 0, unitCost: 2.00, lineTotal: 50.00 },
        { poId: po2.id, productId: prodBySku['SNK-003'].id, productName: 'Organic Granola Bar', sku: 'SNK-003', orderedQty: 50, receivedQty: 0, unitCost: 1.20, lineTotal: 60.00 },
      ],
    })
  } catch (e) {
    console.error('PO-SEED-002 items error:', e)
  }
  console.log('Purchase Orders: 2 seeded with items')

  // ─── Service Cases ───────────────────────────────────────────────────────────
  const case001 = await prisma.serviceCase.upsert({
    where: { caseNumber: 'CS-SEED-001' },
    update: {},
    create: {
      id: 'case-001',
      caseNumber: 'CS-SEED-001',
      customerId: alice.id,
      subject: 'Wireless earbuds stopped charging after 2 weeks',
      status: 'in_progress',
      priority: 'high',
      category: 'Product Defect',
      assignedTo: 'Marcus Thompson',
    },
  })

  await prisma.serviceCase.upsert({
    where: { caseNumber: 'CS-SEED-002' },
    update: {},
    create: {
      id: 'case-002',
      caseNumber: 'CS-SEED-002',
      customerId: bob.id,
      subject: 'Loyalty points not applied to last transaction',
      status: 'open',
      priority: 'medium',
      category: 'Billing',
    },
  })

  await prisma.serviceCase.upsert({
    where: { caseNumber: 'CS-SEED-003' },
    update: {},
    create: {
      id: 'case-003',
      caseNumber: 'CS-SEED-003',
      customerId: carol.id,
      subject: 'Request for bulk discount on electronics',
      status: 'resolved',
      priority: 'low',
      category: 'Sales Inquiry',
      resolvedAt: new Date('2026-04-20T15:00:00Z'),
    },
  })
  console.log('Service Cases: 3 seeded')

  // Case note on case-001
  // Use deleteMany+create pattern since CaseNote has no natural unique key besides id
  const existingNote = await prisma.caseNote.findFirst({
    where: { caseId: case001.id, authorId: emp001.id },
  })
  if (!existingNote) {
    await prisma.caseNote.create({
      data: {
        caseId: case001.id,
        authorId: emp001.id,
        content: 'Customer brought item in for inspection. Confirmed hardware fault. Replacement ordered.',
        isPublic: false,
      },
    })
  }
  console.log('Case note seeded')

  // ─── Campaigns ───────────────────────────────────────────────────────────────
  await prisma.campaign.upsert({
    where: { id: 'camp-001' },
    update: {},
    create: {
      id: 'camp-001',
      name: 'April Spring Sale',
      type: 'email',
      status: 'active',
      subject: 'Spring into Savings — 20% Off Electronics',
      targetCount: 1500,
      sentCount: 1423,
      openCount: 387,
      startDate: new Date('2026-04-01T00:00:00Z'),
      endDate: new Date('2026-04-30T23:59:59Z'),
    },
  })

  await prisma.campaign.upsert({
    where: { id: 'camp-002' },
    update: {},
    create: {
      id: 'camp-002',
      name: 'Loyalty Member Rewards',
      type: 'sms',
      status: 'completed',
      targetCount: 450,
      sentCount: 450,
      openCount: 312,
      startDate: new Date('2026-03-15T00:00:00Z'),
      endDate: new Date('2026-03-31T23:59:59Z'),
    },
  })

  await prisma.campaign.upsert({
    where: { id: 'camp-003' },
    update: {},
    create: {
      id: 'camp-003',
      name: 'Summer Preview Launch',
      type: 'email',
      status: 'scheduled',
      subject: 'Sneak Peek: Summer Collection',
      targetCount: 2000,
      sentCount: 0,
      openCount: 0,
      startDate: new Date('2026-05-01T00:00:00Z'),
      endDate: new Date('2026-05-31T23:59:59Z'),
    },
  })
  console.log('Campaigns: 3 seeded')

  // ─── Work Orders ─────────────────────────────────────────────────────────────
  await prisma.workOrder.upsert({
    where: { woNumber: 'WO-SEED-001' },
    update: {},
    create: {
      id: 'wo-001',
      woNumber: 'WO-SEED-001',
      storeId: storeMain.id,
      title: 'POS terminal screen replacement',
      status: 'in_progress',
      priority: 'high',
      assignedTo: 'Marcus Thompson',
      scheduledAt: new Date('2026-04-21T10:00:00Z'),
      estimatedHrs: 2.0,
      actualHrs: 1.5,
    },
  })

  await prisma.workOrder.upsert({
    where: { woNumber: 'WO-SEED-002' },
    update: {},
    create: {
      id: 'wo-002',
      woNumber: 'WO-SEED-002',
      storeId: storeNorth.id,
      title: 'Security camera installation - north entrance',
      status: 'new',
      priority: 'medium',
      scheduledAt: new Date('2026-04-24T09:00:00Z'),
      estimatedHrs: 4.0,
    },
  })

  await prisma.workOrder.upsert({
    where: { woNumber: 'WO-SEED-003' },
    update: {},
    create: {
      id: 'wo-003',
      woNumber: 'WO-SEED-003',
      storeId: storeMain.id,
      title: 'Quarterly HVAC inspection',
      status: 'completed',
      priority: 'low',
      completedAt: new Date('2026-04-18T14:00:00Z'),
      estimatedHrs: 1.5,
      actualHrs: 1.0,
    },
  })
  console.log('Work Orders: 3 seeded')

  // ─── Chart of Accounts ───────────────────────────────────────────────────────
  const accounts = await Promise.all([
    prisma.account.upsert({ where: { code: '1000' }, update: {}, create: { id: 'acc-1000', code: '1000', name: 'Cash & Equivalents', type: 'asset', subtype: 'current', balance: 48250.00 } }),
    prisma.account.upsert({ where: { code: '1200' }, update: {}, create: { id: 'acc-1200', code: '1200', name: 'Accounts Receivable', type: 'asset', subtype: 'current', balance: 12400.00 } }),
    prisma.account.upsert({ where: { code: '1500' }, update: {}, create: { id: 'acc-1500', code: '1500', name: 'Inventory Asset', type: 'asset', subtype: 'current', balance: 23600.00 } }),
    prisma.account.upsert({ where: { code: '2000' }, update: {}, create: { id: 'acc-2000', code: '2000', name: 'Accounts Payable', type: 'liability', subtype: 'current', balance: -8900.00 } }),
    prisma.account.upsert({ where: { code: '3000' }, update: {}, create: { id: 'acc-3000', code: '3000', name: 'Owner Equity', type: 'equity', balance: 75350.00 } }),
    prisma.account.upsert({ where: { code: '4000' }, update: {}, create: { id: 'acc-4000', code: '4000', name: 'Sales Revenue', type: 'revenue', balance: 84200.00 } }),
    prisma.account.upsert({ where: { code: '5000' }, update: {}, create: { id: 'acc-5000', code: '5000', name: 'Cost of Goods Sold', type: 'expense', subtype: 'cogs', balance: 31500.00 } }),
    prisma.account.upsert({ where: { code: '6000' }, update: {}, create: { id: 'acc-6000', code: '6000', name: 'Operating Expenses', type: 'expense', subtype: 'operating', balance: 12750.00 } }),
  ])
  const accCash = accounts[0]
  const accRevenue = accounts[5]
  console.log('Accounts:', accounts.length)

  // ─── Journal Entry ───────────────────────────────────────────────────────────
  const existingJE = await prisma.journalEntry.findFirst({ where: { reference: 'JE-SEED-001' } })
  if (!existingJE) {
    const je001 = await prisma.journalEntry.create({
      data: {
        id: 'je-001',
        reference: 'JE-SEED-001',
        description: 'April 21 daily sales close',
        date: new Date('2026-04-21T23:59:00Z'),
      },
    })
    await prisma.journalLine.createMany({
      data: [
        { entryId: je001.id, accountId: accCash.id, debit: 1240.50, credit: 0, memo: 'Daily cash receipts' },
        { entryId: je001.id, accountId: accRevenue.id, debit: 0, credit: 1240.50, memo: 'Sales revenue recognized' },
      ],
    })
    console.log('Journal Entry seeded')
  } else {
    console.log('Journal Entry already exists, skipping')
  }

  // ─── WMS Location ────────────────────────────────────────────────────────────
  await prisma.wmsLocation.upsert({
    where: { locationCode: 'MAIN-WH' },
    update: {},
    create: {
      id: 'loc-001',
      locationCode: 'MAIN-WH',
      name: 'Main Street Warehouse',
      address: '456 Warehouse Blvd',
      city: 'Austin',
      state: 'TX',
      requireReceive: true,
      requirePutaway: true,
      binMandatory: true,
    },
  })
  console.log('WMS Location seeded')

  // ─── WMS Zones ───────────────────────────────────────────────────────────────
  await prisma.wmsZone.upsert({
    where: { locationCode_zoneCode: { locationCode: 'MAIN-WH', zoneCode: 'A' } },
    update: {},
    create: {
      id: 'zone-001',
      locationCode: 'MAIN-WH',
      zoneCode: 'A',
      name: 'Electronics Zone',
      zoneType: 'STORAGE',
    },
  })

  await prisma.wmsZone.upsert({
    where: { locationCode_zoneCode: { locationCode: 'MAIN-WH', zoneCode: 'B' } },
    update: {},
    create: {
      id: 'zone-002',
      locationCode: 'MAIN-WH',
      zoneCode: 'B',
      name: 'Food & Beverage Zone',
      zoneType: 'STORAGE',
    },
  })
  console.log('WMS Zones: 2 seeded')

  // ─── WMS Bins ────────────────────────────────────────────────────────────────
  // Bins in this schema require a rackCode FK if rackCode is provided —
  // WmsBin.rack relation uses (locationCode, zoneCode, rackCode).
  // Since we have no racks seeded, omit rackCode (it's optional: String?) so the
  // bin is zone-level only, which is valid per the schema.
  await prisma.wmsBin.upsert({
    where: { locationCode_zoneCode_binCode: { locationCode: 'MAIN-WH', zoneCode: 'A', binCode: 'A-01' } },
    update: {},
    create: {
      id: 'bin-001',
      locationCode: 'MAIN-WH',
      zoneCode: 'A',
      binCode: 'A-01',
      binType: 'STORAGE',
      isEmpty: false,
    },
  })

  await prisma.wmsBin.upsert({
    where: { locationCode_zoneCode_binCode: { locationCode: 'MAIN-WH', zoneCode: 'A', binCode: 'A-02' } },
    update: {},
    create: {
      id: 'bin-002',
      locationCode: 'MAIN-WH',
      zoneCode: 'A',
      binCode: 'A-02',
      binType: 'STORAGE',
      isEmpty: false,
    },
  })

  await prisma.wmsBin.upsert({
    where: { locationCode_zoneCode_binCode: { locationCode: 'MAIN-WH', zoneCode: 'B', binCode: 'B-01' } },
    update: {},
    create: {
      id: 'bin-003',
      locationCode: 'MAIN-WH',
      zoneCode: 'B',
      binCode: 'B-01',
      binType: 'STORAGE',
      isEmpty: false,
    },
  })
  console.log('WMS Bins: 3 seeded')

  // ── Business Central Finance Seeds ──────────────────────────────────────────

  // Vendor Groups
  const vendorGroups = await Promise.all([
    prisma.vendorGroup.upsert({ where: { code: 'MERCH' }, update: {}, create: { code: 'MERCH', name: 'Merchandise Suppliers', defaultPayTerms: 'Net30' } }),
    prisma.vendorGroup.upsert({ where: { code: 'SVCS' }, update: {}, create: { code: 'SVCS', name: 'Services & Utilities', defaultPayTerms: 'Net15' } }),
    prisma.vendorGroup.upsert({ where: { code: 'TECH' }, update: {}, create: { code: 'TECH', name: 'Technology & Software', defaultPayTerms: 'Net45' } }),
  ])

  // Vendors
  const vendors = await Promise.all([
    prisma.vendor.upsert({ where: { vendorCode: 'V-GLO-001' }, update: {}, create: { vendorCode: 'V-GLO-001', name: 'Global Imports LLC', vendorGroupId: vendorGroups[0].id, email: 'ap@globalimports.com', paymentTerms: 'Net30', paymentMethod: 'ACH', creditLimit: 50000, isActive: true } }),
    prisma.vendor.upsert({ where: { vendorCode: 'V-TEC-002' }, update: {}, create: { vendorCode: 'V-TEC-002', name: 'TechSoft Solutions', vendorGroupId: vendorGroups[2].id, email: 'billing@techsoft.com', paymentTerms: 'Net45', paymentMethod: 'Wire', creditLimit: 25000, isActive: true } }),
    prisma.vendor.upsert({ where: { vendorCode: 'V-UTL-003' }, update: {}, create: { vendorCode: 'V-UTL-003', name: 'City Power & Water', vendorGroupId: vendorGroups[1].id, email: 'accounts@citypw.gov', paymentTerms: 'Net15', paymentMethod: 'Check', isActive: true } }),
  ])

  // Vendor Invoices (some open, some paid)
  const now = new Date()
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
  const fifteenDaysAgo = new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000)
  const tenDaysFromNow = new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000)
  const overdueDate = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000)

  await prisma.vendorInvoice.upsert({
    where: { invoiceNumber: 'VINV-SEED-001' },
    update: {},
    create: {
      invoiceNumber: 'VINV-SEED-001', vendorId: vendors[0].id,
      invoiceDate: thirtyDaysAgo, dueDate: tenDaysFromNow,
      subtotal: 12500, taxAmount: 1031.25, totalAmount: 13531.25, paidAmount: 0,
      status: 'posted', matchingStatus: 'two_way',
      lines: { create: [
        { description: 'Holiday merchandise lot A', quantity: 500, unitPrice: 15, lineAmount: 7500, taxAmount: 618.75 },
        { description: 'Holiday merchandise lot B', quantity: 250, unitPrice: 20, lineAmount: 5000, taxAmount: 412.50 },
      ]}
    }
  })

  await prisma.vendorInvoice.upsert({
    where: { invoiceNumber: 'VINV-SEED-002' },
    update: {},
    create: {
      invoiceNumber: 'VINV-SEED-002', vendorId: vendors[1].id,
      invoiceDate: fifteenDaysAgo, dueDate: overdueDate,
      subtotal: 4800, taxAmount: 396, totalAmount: 5196, paidAmount: 0,
      status: 'posted', matchingStatus: 'none',
      lines: { create: [
        { description: 'POS Software Annual License', quantity: 1, unitPrice: 3600, lineAmount: 3600, taxAmount: 297 },
        { description: 'Hardware Support Contract', quantity: 1, unitPrice: 1200, lineAmount: 1200, taxAmount: 99 },
      ]}
    }
  })

  await prisma.vendorInvoice.upsert({
    where: { invoiceNumber: 'VINV-SEED-003' },
    update: {},
    create: {
      invoiceNumber: 'VINV-SEED-003', vendorId: vendors[2].id,
      invoiceDate: thirtyDaysAgo, dueDate: overdueDate,
      subtotal: 850, taxAmount: 0, totalAmount: 850, paidAmount: 850,
      status: 'paid', matchingStatus: 'two_way',
      lines: { create: [
        { description: 'Monthly utilities - March 2026', quantity: 1, unitPrice: 850, lineAmount: 850, taxAmount: 0 },
      ]}
    }
  })

  // Bank Accounts
  await prisma.bankAccount.upsert({
    where: { accountCode: 'BANK-CHK-001' },
    update: {},
    create: {
      accountCode: 'BANK-CHK-001', bankName: 'First National Bank',
      accountNumber: '****4521', accountType: 'checking',
      currentBalance: 87450.22, isActive: true, isPrimary: true
    }
  })

  await prisma.bankAccount.upsert({
    where: { accountCode: 'BANK-SAV-001' },
    update: {},
    create: {
      accountCode: 'BANK-SAV-001', bankName: 'First National Bank',
      accountNumber: '****7832', accountType: 'savings',
      currentBalance: 125000.00, isActive: true, isPrimary: false
    }
  })

  // Fiscal Year 2026
  await prisma.fiscalYear.upsert({
    where: { name: 'FY2026' },
    update: {},
    create: {
      name: 'FY2026', startDate: new Date('2026-01-01'), endDate: new Date('2026-12-31'), status: 'open',
      periods: { create: [
        { periodNumber: 1,  name: 'Jan 2026', startDate: new Date('2026-01-01'), endDate: new Date('2026-01-31'), status: 'closed' },
        { periodNumber: 2,  name: 'Feb 2026', startDate: new Date('2026-02-01'), endDate: new Date('2026-02-28'), status: 'closed' },
        { periodNumber: 3,  name: 'Mar 2026', startDate: new Date('2026-03-01'), endDate: new Date('2026-03-31'), status: 'closed' },
        { periodNumber: 4,  name: 'Apr 2026', startDate: new Date('2026-04-01'), endDate: new Date('2026-04-30'), status: 'open' },
        { periodNumber: 5,  name: 'May 2026', startDate: new Date('2026-05-01'), endDate: new Date('2026-05-31'), status: 'open' },
        { periodNumber: 6,  name: 'Jun 2026', startDate: new Date('2026-06-01'), endDate: new Date('2026-06-30'), status: 'open' },
        { periodNumber: 7,  name: 'Jul 2026', startDate: new Date('2026-07-01'), endDate: new Date('2026-07-31'), status: 'open' },
        { periodNumber: 8,  name: 'Aug 2026', startDate: new Date('2026-08-01'), endDate: new Date('2026-08-31'), status: 'open' },
        { periodNumber: 9,  name: 'Sep 2026', startDate: new Date('2026-09-01'), endDate: new Date('2026-09-30'), status: 'open' },
        { periodNumber: 10, name: 'Oct 2026', startDate: new Date('2026-10-01'), endDate: new Date('2026-10-31'), status: 'open' },
        { periodNumber: 11, name: 'Nov 2026', startDate: new Date('2026-11-01'), endDate: new Date('2026-11-30'), status: 'open' },
        { periodNumber: 12, name: 'Dec 2026', startDate: new Date('2026-12-01'), endDate: new Date('2026-12-31'), status: 'open' },
      ]}
    }
  })

  // Fiscal Year 2025 (prior year, closed)
  await prisma.fiscalYear.upsert({
    where: { name: 'FY2025' },
    update: {},
    create: {
      name: 'FY2025', startDate: new Date('2025-01-01'), endDate: new Date('2025-12-31'), status: 'closed',
      closedAt: new Date('2026-01-15'),
      periods: { create: Array.from({ length: 12 }, (_, i) => ({
        periodNumber: i + 1,
        name: new Date(2025, i, 1).toLocaleString('en-US', { month: 'short' }) + ' 2025',
        startDate: new Date(2025, i, 1),
        endDate: new Date(2025, i + 1, 0),
        status: 'closed',
        closedAt: new Date('2026-01-15')
      }))}
    }
  })

  console.log('✅ BC Finance seed data complete')

  console.log('\nSeed complete! All models populated.')
}

main().catch(console.error).finally(() => prisma.$disconnect())
