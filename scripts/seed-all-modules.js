/**
 * NovaPOS — Comprehensive Demo Seed
 * Seeds: Employees, Loyalty Programs+Cards, Gift Cards, GL Accounts (COA),
 *        Budget Plans, Purchase Orders, Service Cases, Historical Orders,
 *        Journal Entries
 *
 * Idempotent: uses upsert / findFirst+create patterns throughout.
 * Run: node scripts/seed-all-modules.js
 */

const { PrismaClient } = require('@prisma/client')
const { PrismaLibSql } = require('@prisma/adapter-libsql')

const adapter = new PrismaLibSql({ url: 'file:prisma/dev.db' })
const prisma = new PrismaClient({ adapter })

// ─── helpers ──────────────────────────────────────────────────────────────────

function daysAgo(n) {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d
}

function randomBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

// ─── main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('='.repeat(60))
  console.log('  NovaPOS Comprehensive Demo Seed')
  console.log('='.repeat(60))

  // ── Fetch existing anchors ──────────────────────────────────────────────────
  const customers  = await prisma.customer.findMany({ select: { id: true, firstName: true, lastName: true } })
  const suppliers  = await prisma.supplier.findMany({ select: { id: true, name: true } })
  const products   = await prisma.product.findMany({
    select: { id: true, name: true, sku: true, costPrice: true, salePrice: true },
    take: 30,
  })
  const stores     = await prisma.store.findMany({ select: { id: true, name: true } })
  const users      = await prisma.user.findMany({ select: { id: true, email: true, name: true, role: true } })

  if (!stores.length) { console.error('ERROR: No stores found. Run base seed first.'); process.exit(1) }
  if (!customers.length) { console.error('ERROR: No customers found. Run base seed first.'); process.exit(1) }
  if (!products.length) { console.error('ERROR: No products found. Run base seed first.'); process.exit(1) }

  const store1Id = stores[0].id
  const store2Id = stores.length > 1 ? stores[1].id : stores[0].id

  // ── 1. EMPLOYEES ───────────────────────────────────────────────────────────
  console.log('\n[1/9] Seeding employees...')

  const newEmployees = [
    { email: 'sarah.manager@novapos.local',    name: 'Sarah Mitchell',   position: 'Store Manager',       department: 'Management', hourlyRate: 28.50, role: 'manager',    storeId: store1Id },
    { email: 'daniel.asst@novapos.local',      name: 'Daniel Torres',    position: 'Assistant Manager',   department: 'Management', hourlyRate: 22.00, role: 'manager',    storeId: store1Id },
    { email: 'jessica.cash@novapos.local',     name: 'Jessica Wong',     position: 'Senior Cashier',      department: 'Sales',      hourlyRate: 16.50, role: 'cashier',    storeId: store1Id },
    { email: 'marcus.cash@novapos.local',      name: 'Marcus Reed',      position: 'Cashier',             department: 'Sales',      hourlyRate: 15.25, role: 'cashier',    storeId: store2Id },
    { email: 'amy.cash@novapos.local',         name: 'Amy Nguyen',       position: 'Cashier',             department: 'Sales',      hourlyRate: 15.00, role: 'cashier',    storeId: store2Id },
  ]

  let empCreated = 0
  for (const emp of newEmployees) {
    const existing = await prisma.user.findUnique({ where: { email: emp.email } })
    if (!existing) {
      const [firstName, ...rest] = emp.name.split(' ')
      const lastName = rest.join(' ')
      const user = await prisma.user.create({
        data: {
          email:        emp.email,
          name:         emp.name,
          role:         emp.role,
          passwordHash: '$2a$10$placeholder.hash.for.demo.data.only',
          isActive:     true,
        },
      })
      await prisma.employee.create({
        data: {
          userId:     user.id,
          storeId:    emp.storeId,
          firstName,
          lastName,
          position:   emp.position,
          department: emp.department,
          hourlyRate: emp.hourlyRate,
          hireDate:   daysAgo(randomBetween(30, 730)),
          isActive:   true,
        },
      })
      empCreated++
    }
  }
  console.log(`   + ${empCreated} employees created`)

  // ── 2. LOYALTY PROGRAM + CARDS ─────────────────────────────────────────────
  console.log('\n[2/9] Seeding loyalty program and cards...')

  let program = await prisma.loyaltyProgram.findFirst({ where: { name: 'NovaPOS Rewards' } })
  if (!program) {
    program = await prisma.loyaltyProgram.create({
      data: {
        name:            'NovaPOS Rewards',
        description:     'Earn points on every purchase. Redeem for discounts.',
        isActive:        true,
        pointsName:      'Nova Points',
        pointsPerDollar: 1.0,
        dollarPerPoint:  0.01,
        minRedeemPoints: 100,
        maxRedeemPct:    50,
        pointsExpireDays: 365,
        allowGuestEarn:  false,
      },
    })
    console.log('   + Loyalty program created')
  } else {
    console.log('   ~ Loyalty program already exists, skipping')
  }

  // Tiers
  const tierDefs = [
    { name: 'Bronze',   minPoints:    0, earnMultiplier: 1.0, color: '#CD7F32', benefits: 'Standard earning rate',                          sortOrder: 0 },
    { name: 'Silver',   minPoints:  500, earnMultiplier: 1.25, color: '#C0C0C0', benefits: '25% bonus points on all purchases',              sortOrder: 1 },
    { name: 'Gold',     minPoints: 2000, earnMultiplier: 1.5,  color: '#FFD700', benefits: '50% bonus points + free gift wrapping',          sortOrder: 2 },
    { name: 'Platinum', minPoints: 5000, earnMultiplier: 2.0,  color: '#E5E4E2', benefits: 'Double points + priority service + free shipping', sortOrder: 3 },
  ]

  const tiers = {}
  for (const td of tierDefs) {
    let tier = await prisma.loyaltyTier.findFirst({ where: { programId: program.id, name: td.name } })
    if (!tier) {
      tier = await prisma.loyaltyTier.create({
        data: { programId: program.id, ...td },
      })
    }
    tiers[td.name] = tier
  }
  console.log('   + 4 loyalty tiers upserted')

  function getTierForPoints(pts) {
    if (pts >= 5000) return tiers['Platinum']
    if (pts >= 2000) return tiers['Gold']
    if (pts >= 500)  return tiers['Silver']
    return tiers['Bronze']
  }

  let cardsCreated = 0
  for (let i = 0; i < customers.length; i++) {
    const cust = customers[i]
    const cardNumber = `LC-2026-${String(i + 1).padStart(5, '0')}`
    const existing = await prisma.loyaltyCard.findFirst({ where: { customerId: cust.id } })
    if (!existing) {
      const pts = randomBetween(50, 8500)
      const tier = getTierForPoints(pts)
      await prisma.loyaltyCard.create({
        data: {
          cardNumber,
          programId:     program.id,
          customerId:    cust.id,
          tierId:        tier.id,
          currentPoints: pts,
          lifetimePoints: pts + randomBetween(0, 2000),
          lifetimeSpend: parseFloat((pts * 1.8 + randomBetween(50, 500)).toFixed(2)),
          isActive:      true,
          enrolledAt:    daysAgo(randomBetween(10, 400)),
          lastActivityAt: daysAgo(randomBetween(1, 60)),
        },
      })
      cardsCreated++
    }
  }
  console.log(`   + ${cardsCreated} loyalty cards created (${customers.length} customers)`)

  // ── 3. GIFT CARDS ──────────────────────────────────────────────────────────
  console.log('\n[3/9] Seeding gift cards...')

  const giftCardDefs = [
    { code: 'GC-2026-1001', initial: 100,  current: 100,  customerId: null,                         active: true  },
    { code: 'GC-2026-1002', initial: 50,   current: 50,   customerId: customers[0]?.id ?? null,     active: true  },
    { code: 'GC-2026-1003', initial: 250,  current: 175,  customerId: customers[1]?.id ?? null,     active: true  },
    { code: 'GC-2026-1004', initial: 500,  current: 500,  customerId: null,                         active: true  },
    { code: 'GC-2026-1005', initial: 25,   current: 0,    customerId: customers[2]?.id ?? null,     active: false },
    { code: 'GC-2026-1006', initial: 200,  current: 65,   customerId: customers[3]?.id ?? null,     active: true  },
    { code: 'GC-2026-1007', initial: 75,   current: 75,   customerId: null,                         active: true  },
    { code: 'GC-2026-1008', initial: 150,  current: 150,  customerId: null,                         active: true  },
    { code: 'GC-2026-1009', initial: 10,   current: 3.50, customerId: customers[4]?.id ?? null,     active: true  },
    { code: 'GC-2026-1010', initial: 300,  current: 300,  customerId: null,                         active: true  },
    { code: 'GC-2026-1011', initial: 100,  current: 100,  customerId: null,                         active: true  },
    { code: 'GC-2026-1012', initial: 50,   current: 50,   customerId: null,                         active: true  },
    { code: 'GC-2026-1013', initial: 25,   current: 25,   customerId: null,                         active: true  },
    { code: 'GC-2026-1014', initial: 500,  current: 412,  customerId: null,                         active: true  },
    { code: 'GC-2026-1015', initial: 200,  current: 0,    customerId: null,                         active: false },
  ]

  let gcCreated = 0
  for (const gc of giftCardDefs) {
    const existing = await prisma.giftCard.findUnique({ where: { cardNumber: gc.code } })
    if (!existing) {
      const card = await prisma.giftCard.create({
        data: {
          cardNumber:     gc.code,
          initialValue:   gc.initial,
          currentBalance: gc.current,
          isActive:       gc.active,
          customerId:     gc.customerId,
          issuedAt:       daysAgo(randomBetween(5, 180)),
          expiresAt:      new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
        },
      })
      // Create ISSUE transaction
      await prisma.giftCardTransaction.create({
        data: {
          giftCardId:    card.id,
          type:          'ISSUE',
          amount:        gc.initial,
          balanceBefore: 0,
          balanceAfter:  gc.initial,
          reference:     `ISSUE-${gc.code}`,
        },
      })
      // If partially or fully redeemed, add REDEEM transaction
      if (gc.current < gc.initial) {
        const redeemed = gc.initial - gc.current
        await prisma.giftCardTransaction.create({
          data: {
            giftCardId:    card.id,
            type:          'REDEEM',
            amount:        redeemed,
            balanceBefore: gc.initial,
            balanceAfter:  gc.current,
            reference:     `RDM-${gc.code}`,
          },
        })
      }
      gcCreated++
    }
  }
  console.log(`   + ${gcCreated} gift cards created`)

  // ── 4. GL ACCOUNTS / CHART OF ACCOUNTS ────────────────────────────────────
  console.log('\n[4/9] Seeding GL accounts (Chart of Accounts)...')

  const accountDefs = [
    // Assets (1000-1999)
    { code: '1000', name: 'Cash - Main Register',          type: 'asset',     subtype: 'current',      mainAccountType: 'balance_sheet' },
    { code: '1010', name: 'Cash - Store 2 Register',       type: 'asset',     subtype: 'current',      mainAccountType: 'balance_sheet' },
    { code: '1020', name: 'Petty Cash',                    type: 'asset',     subtype: 'current',      mainAccountType: 'balance_sheet' },
    { code: '1050', name: 'Checking Account - Operating',  type: 'asset',     subtype: 'bank',         mainAccountType: 'balance_sheet' },
    { code: '1060', name: 'Savings Account - Reserve',     type: 'asset',     subtype: 'bank',         mainAccountType: 'balance_sheet' },
    { code: '1100', name: 'Accounts Receivable',           type: 'asset',     subtype: 'current',      mainAccountType: 'balance_sheet' },
    { code: '1110', name: 'AR - Gift Cards Issued',        type: 'asset',     subtype: 'current',      mainAccountType: 'balance_sheet' },
    { code: '1120', name: 'AR - Loyalty Points Liability', type: 'liability', subtype: 'current',      mainAccountType: 'balance_sheet' },
    { code: '1200', name: 'Inventory - Merchandise',       type: 'asset',     subtype: 'current',      mainAccountType: 'balance_sheet' },
    { code: '1210', name: 'Inventory - In Transit',        type: 'asset',     subtype: 'current',      mainAccountType: 'balance_sheet' },
    { code: '1300', name: 'Prepaid Expenses',              type: 'asset',     subtype: 'current',      mainAccountType: 'balance_sheet' },
    { code: '1310', name: 'Prepaid Insurance',             type: 'asset',     subtype: 'current',      mainAccountType: 'balance_sheet' },
    { code: '1500', name: 'Fixed Assets - Equipment',      type: 'asset',     subtype: 'fixed',        mainAccountType: 'balance_sheet' },
    { code: '1510', name: 'Fixed Assets - Fixtures',       type: 'asset',     subtype: 'fixed',        mainAccountType: 'balance_sheet' },
    { code: '1520', name: 'Fixed Assets - Computers',      type: 'asset',     subtype: 'fixed',        mainAccountType: 'balance_sheet' },
    { code: '1590', name: 'Accumulated Depreciation',      type: 'asset',     subtype: 'contra',       mainAccountType: 'balance_sheet' },
    // Liabilities (2000-2999)
    { code: '2000', name: 'Accounts Payable',              type: 'liability', subtype: 'current',      mainAccountType: 'balance_sheet' },
    { code: '2010', name: 'AP - Trade Payables',           type: 'liability', subtype: 'current',      mainAccountType: 'balance_sheet' },
    { code: '2100', name: 'Sales Tax Payable',             type: 'liability', subtype: 'current',      mainAccountType: 'balance_sheet' },
    { code: '2110', name: 'Use Tax Payable',               type: 'liability', subtype: 'current',      mainAccountType: 'balance_sheet' },
    { code: '2200', name: 'Payroll Taxes Payable',         type: 'liability', subtype: 'current',      mainAccountType: 'balance_sheet' },
    { code: '2210', name: 'Federal Income Tax Payable',    type: 'liability', subtype: 'current',      mainAccountType: 'balance_sheet' },
    { code: '2220', name: 'State Income Tax Payable',      type: 'liability', subtype: 'current',      mainAccountType: 'balance_sheet' },
    { code: '2300', name: 'Deferred Revenue - Gift Cards', type: 'liability', subtype: 'current',      mainAccountType: 'balance_sheet' },
    { code: '2400', name: 'Long-Term Debt',                type: 'liability', subtype: 'long_term',    mainAccountType: 'balance_sheet' },
    // Equity (3000-3999)
    { code: '3000', name: 'Owner Equity',                  type: 'equity',    subtype: 'equity',       mainAccountType: 'balance_sheet' },
    { code: '3100', name: 'Retained Earnings',             type: 'equity',    subtype: 'retained',     mainAccountType: 'balance_sheet' },
    { code: '3200', name: 'Current Year Earnings',         type: 'equity',    subtype: 'current_year', mainAccountType: 'balance_sheet' },
    // Revenue (4000-4999)
    { code: '4000', name: 'Sales Revenue',                 type: 'revenue',   subtype: 'operating',    mainAccountType: 'profit_loss' },
    { code: '4010', name: 'Sales - Electronics',           type: 'revenue',   subtype: 'operating',    mainAccountType: 'profit_loss' },
    { code: '4020', name: 'Sales - Apparel',               type: 'revenue',   subtype: 'operating',    mainAccountType: 'profit_loss' },
    { code: '4030', name: 'Sales - Food & Beverage',       type: 'revenue',   subtype: 'operating',    mainAccountType: 'profit_loss' },
    { code: '4040', name: 'Sales - Home & Garden',         type: 'revenue',   subtype: 'operating',    mainAccountType: 'profit_loss' },
    { code: '4050', name: 'Gift Card Revenue Recognized',  type: 'revenue',   subtype: 'operating',    mainAccountType: 'profit_loss' },
    { code: '4100', name: 'Service Revenue',               type: 'revenue',   subtype: 'operating',    mainAccountType: 'profit_loss' },
    { code: '4200', name: 'Sales Discounts',               type: 'revenue',   subtype: 'contra',       mainAccountType: 'profit_loss' },
    { code: '4300', name: 'Sales Returns & Allowances',    type: 'revenue',   subtype: 'contra',       mainAccountType: 'profit_loss' },
    // COGS (5000-5999)
    { code: '5000', name: 'Cost of Goods Sold',            type: 'expense',   subtype: 'cogs',         mainAccountType: 'profit_loss' },
    { code: '5010', name: 'COGS - Electronics',            type: 'expense',   subtype: 'cogs',         mainAccountType: 'profit_loss' },
    { code: '5020', name: 'COGS - Apparel',                type: 'expense',   subtype: 'cogs',         mainAccountType: 'profit_loss' },
    { code: '5030', name: 'COGS - Food & Beverage',        type: 'expense',   subtype: 'cogs',         mainAccountType: 'profit_loss' },
    { code: '5100', name: 'Freight & Shipping In',         type: 'expense',   subtype: 'cogs',         mainAccountType: 'profit_loss' },
    { code: '5200', name: 'Inventory Adjustments',         type: 'expense',   subtype: 'cogs',         mainAccountType: 'profit_loss' },
    // Operating Expenses (6000-6999)
    { code: '6000', name: 'Payroll Expense - Wages',       type: 'expense',   subtype: 'payroll',      mainAccountType: 'profit_loss' },
    { code: '6010', name: 'Payroll Expense - OT',          type: 'expense',   subtype: 'payroll',      mainAccountType: 'profit_loss' },
    { code: '6020', name: 'Payroll Tax Expense',           type: 'expense',   subtype: 'payroll',      mainAccountType: 'profit_loss' },
    { code: '6030', name: 'Employee Benefits',             type: 'expense',   subtype: 'payroll',      mainAccountType: 'profit_loss' },
    { code: '6100', name: 'Rent Expense',                  type: 'expense',   subtype: 'occupancy',    mainAccountType: 'profit_loss' },
    { code: '6110', name: 'Utilities Expense',             type: 'expense',   subtype: 'occupancy',    mainAccountType: 'profit_loss' },
    { code: '6120', name: 'Maintenance & Repairs',         type: 'expense',   subtype: 'occupancy',    mainAccountType: 'profit_loss' },
    { code: '6200', name: 'Marketing & Advertising',       type: 'expense',   subtype: 'marketing',    mainAccountType: 'profit_loss' },
    { code: '6210', name: 'Social Media & Digital Ads',    type: 'expense',   subtype: 'marketing',    mainAccountType: 'profit_loss' },
    { code: '6300', name: 'Insurance Expense',             type: 'expense',   subtype: 'general',      mainAccountType: 'profit_loss' },
    { code: '6310', name: 'Office Supplies',               type: 'expense',   subtype: 'general',      mainAccountType: 'profit_loss' },
    { code: '6320', name: 'Bank Charges & Fees',           type: 'expense',   subtype: 'general',      mainAccountType: 'profit_loss' },
    { code: '6330', name: 'Credit Card Processing Fees',   type: 'expense',   subtype: 'general',      mainAccountType: 'profit_loss' },
    { code: '6400', name: 'Depreciation Expense',          type: 'expense',   subtype: 'depreciation', mainAccountType: 'profit_loss' },
    { code: '6500', name: 'Professional Services',         type: 'expense',   subtype: 'general',      mainAccountType: 'profit_loss' },
    { code: '6600', name: 'Loyalty Program Expense',       type: 'expense',   subtype: 'general',      mainAccountType: 'profit_loss' },
  ]

  const accountMap = {}
  let acctCreated = 0
  for (const acct of accountDefs) {
    let existing = await prisma.account.findUnique({ where: { code: acct.code } })
    if (!existing) {
      existing = await prisma.account.create({ data: acct })
      acctCreated++
    }
    accountMap[acct.code] = existing
  }
  console.log(`   + ${acctCreated} GL accounts created (${accountDefs.length} total defined)`)

  // ── 5. BUDGET PLANS ────────────────────────────────────────────────────────
  console.log('\n[5/9] Seeding budget plans...')

  const budgetDefs = [
    {
      code: 'FY2026-OPS', name: 'FY2026 Operating Budget', fiscalYear: 'FY2026',
      status: 'active', description: 'Annual operating budget for fiscal year 2026',
      entries: [
        { code: '4000', amount: 2400000 }, { code: '5000', amount: 1320000 },
        { code: '6000', amount: 480000  }, { code: '6100', amount: 96000   },
        { code: '6110', amount: 36000   }, { code: '6200', amount: 60000   },
        { code: '6300', amount: 18000   }, { code: '6320', amount: 9600    },
        { code: '6330', amount: 24000   }, { code: '6400', amount: 30000   },
        { code: '6500', amount: 24000   },
      ],
    },
    {
      code: 'FY2026-CAPEX', name: 'FY2026 Capital Expenditure', fiscalYear: 'FY2026',
      status: 'active', description: 'Capital expenditure budget - equipment & fixtures',
      entries: [
        { code: '1500', amount: 45000 }, { code: '1510', amount: 18000 },
        { code: '1520', amount: 22000 }, { code: '6120', amount: 12000 },
      ],
    },
    {
      code: 'Q1-2026-MKT', name: 'Q1 2026 Marketing Budget', fiscalYear: 'FY2026',
      status: 'active', description: 'Q1 2026 marketing and advertising spend',
      entries: [
        { code: '6200', amount: 18000 }, { code: '6210', amount: 9000 },
        { code: '6600', amount: 3000  },
      ],
    },
  ]

  let budgetCreated = 0
  for (const bp of budgetDefs) {
    let plan = await prisma.budgetPlan.findUnique({ where: { code: bp.code } })
    if (!plan) {
      plan = await prisma.budgetPlan.create({
        data: {
          code:        bp.code,
          name:        bp.name,
          fiscalYear:  bp.fiscalYear,
          status:      bp.status,
          description: bp.description,
        },
      })
      for (const entry of bp.entries) {
        const acct = accountMap[entry.code]
        if (acct) {
          await prisma.budgetEntry.create({
            data: {
              budgetPlanId: plan.id,
              accountId:    acct.id,
              budgetAmount: entry.amount,
              periodNumber: null,
            },
          }).catch(() => {}) // skip if unique constraint hits
        }
      }
      budgetCreated++
    }
  }
  console.log(`   + ${budgetCreated} budget plans created`)

  // ── 6. PURCHASE ORDERS ─────────────────────────────────────────────────────
  console.log('\n[6/9] Seeding purchase orders...')

  const poStatuses   = ['draft', 'ordered', 'received', 'partial']
  const poNotes      = [
    'Restock for summer season', 'Routine replenishment', 'Emergency reorder - low stock',
    'New product line introduction', 'End-of-quarter stock-up', null, null,
  ]

  let poCreated = 0
  for (let i = 1; i <= 15; i++) {
    const poNumber = `PO-2026-${String(i + 2).padStart(4, '0')}` // start at PO-2026-0003
    const existing = await prisma.purchaseOrder.findUnique({ where: { poNumber } })
    if (existing) continue

    const supplier   = pick(suppliers)
    const storeId    = i % 3 === 0 ? store2Id : store1Id
    const status     = pick(poStatuses)
    const daysOffset = randomBetween(1, 90)
    const orderDate  = daysAgo(daysOffset)
    const expDate    = new Date(orderDate); expDate.setDate(expDate.getDate() + randomBetween(7, 21))
    const recDate    = (status === 'received') ? new Date(orderDate.getTime() + randomBetween(3, 14) * 86400000) : null

    // Pick 2-4 products for line items
    const lineCount   = randomBetween(2, 4)
    const pickedProds = []
    const usedIdxs    = new Set()
    while (pickedProds.length < lineCount) {
      const idx = randomBetween(0, products.length - 1)
      if (!usedIdxs.has(idx)) { usedIdxs.add(idx); pickedProds.push(products[idx]) }
    }

    let subtotal = 0
    const lineItems = pickedProds.map(p => {
      const qty      = randomBetween(5, 50)
      const cost     = parseFloat((p.costPrice * (0.8 + Math.random() * 0.15)).toFixed(2))
      const total    = parseFloat((qty * cost).toFixed(2))
      subtotal      += total
      return { productId: p.id, productName: p.name, sku: p.sku, orderedQty: qty, receivedQty: status === 'received' ? qty : status === 'partial' ? Math.floor(qty * 0.6) : 0, unitCost: cost, lineTotal: total }
    })

    const shipping = parseFloat((subtotal * 0.02).toFixed(2))
    const tax      = parseFloat((subtotal * 0.0825).toFixed(2))
    const total    = parseFloat((subtotal + shipping + tax).toFixed(2))

    await prisma.purchaseOrder.create({
      data: {
        poNumber,
        supplierId:  supplier.id,
        storeId,
        status,
        subtotal:    parseFloat(subtotal.toFixed(2)),
        taxAmount:   tax,
        shippingCost: shipping,
        totalAmount: total,
        expectedDate: expDate,
        receivedDate: recDate,
        notes:        pick(poNotes),
        createdAt:   orderDate,
        items: { create: lineItems },
      },
    })
    poCreated++
  }
  console.log(`   + ${poCreated} purchase orders created`)

  // ── 7. SERVICE CASES ───────────────────────────────────────────────────────
  console.log('\n[7/9] Seeding service cases...')

  const caseStatuses   = ['open', 'in_progress', 'resolved', 'closed']
  const casePriorities = ['low', 'medium', 'high', 'critical']
  const caseTitles     = [
    'Billing discrepancy on last invoice',
    'Product not working after purchase',
    'Request for refund - damaged item',
    'Warranty claim submission',
    'Loyalty points not credited',
    'Gift card balance issue',
    'Price match request',
    'Item never received - online order',
    'Wrong item delivered',
    'Exchange request - wrong size',
    'Customer wants to cancel order',
    'Technical issue with product setup',
    'Complaint about store service quality',
    'Request for product manual',
    'Bulk order discount inquiry',
    'Loyalty tier upgrade verification',
    'Store credit balance question',
    'Product recall notification',
    'Return outside policy window',
    'Subscription cancellation request',
  ]

  let caseCreated = 0
  for (let i = 4; i <= 23; i++) { // start at CASE-0004
    const caseNumber = `CASE-${String(i).padStart(4, '0')}`
    const existing   = await prisma.serviceCase.findUnique({ where: { caseNumber } })
    if (existing) continue

    const cust      = pick(customers)
    const status    = pick(caseStatuses)
    const priority  = pick(casePriorities)
    const title     = caseTitles[(i - 4) % caseTitles.length]
    const createdAt = daysAgo(randomBetween(1, 90))
    const resolvedAt = (status === 'resolved' || status === 'closed')
      ? new Date(createdAt.getTime() + randomBetween(1, 10) * 86400000)
      : null
    const closedAt = status === 'closed'
      ? new Date((resolvedAt || createdAt).getTime() + randomBetween(1, 5) * 86400000)
      : null

    await prisma.serviceCase.create({
      data: {
        caseNumber,
        customerId:  cust.id,
        title,
        description: `Customer reported: ${title}. Case opened on ${createdAt.toLocaleDateString()}.`,
        status,
        priority,
        assignedTo:  pick(['Sarah Mitchell', 'Daniel Torres', 'Support Team', null]),
        resolvedAt,
        closedAt,
        resolution:  (status === 'resolved' || status === 'closed') ? 'Issue resolved to customer satisfaction.' : null,
        laborHours:  parseFloat((randomBetween(0, 8) * 0.5).toFixed(1)),
        createdAt,
      },
    })
    caseCreated++
  }
  console.log(`   + ${caseCreated} service cases created`)

  // ── 8. HISTORICAL ORDERS ───────────────────────────────────────────────────
  console.log('\n[8/9] Seeding historical orders...')

  const payMethods = ['cash', 'visa', 'mastercard', 'gift-card', 'debit', 'amex']

  // Get highest existing order number
  const lastOrder = await prisma.order.findFirst({ orderBy: { orderNumber: 'desc' } })
  let orderSeq = lastOrder ? parseInt(lastOrder.orderNumber.replace(/\D/g, '')) + 1 : 10001

  let ordersCreated = 0
  for (let i = 0; i < 30; i++) {
    const orderNumber = `ORD-${orderSeq++}`
    const existing    = await prisma.order.findUnique({ where: { orderNumber } })
    if (existing) continue

    const cust       = Math.random() > 0.3 ? pick(customers) : null
    const storeId    = Math.random() > 0.4 ? store1Id : store2Id
    const payMethod  = pick(payMethods)
    const createdAt  = daysAgo(randomBetween(1, 60))

    // Build line items
    const lineCount = randomBetween(1, 4)
    const usedIdx   = new Set()
    const lines     = []
    while (lines.length < lineCount) {
      const idx = randomBetween(0, products.length - 1)
      if (!usedIdx.has(idx)) {
        usedIdx.add(idx)
        const p   = products[idx]
        const qty = randomBetween(1, 3)
        const disc = Math.random() > 0.8 ? parseFloat((p.salePrice * 0.1).toFixed(2)) : 0
        const tax  = parseFloat(((p.salePrice - disc) * qty * 0.0825).toFixed(2))
        const tot  = parseFloat(((p.salePrice - disc) * qty + tax).toFixed(2))
        lines.push({ productId: p.id, productName: p.name, sku: p.sku, quantity: qty, unitPrice: p.salePrice, discount: disc, taxAmount: tax, lineTotal: tot })
      }
    }

    const subtotal = parseFloat(lines.reduce((s, l) => s + (l.unitPrice * l.quantity), 0).toFixed(2))
    const discAmt  = parseFloat(lines.reduce((s, l) => s + l.discount, 0).toFixed(2))
    const taxAmt   = parseFloat(lines.reduce((s, l) => s + l.taxAmount, 0).toFixed(2))
    const total    = parseFloat((subtotal - discAmt + taxAmt).toFixed(2))
    const tendered = payMethod === 'cash' ? parseFloat((Math.ceil(total / 5) * 5).toFixed(2)) : total
    const change   = payMethod === 'cash' ? parseFloat((tendered - total).toFixed(2)) : 0

    await prisma.order.create({
      data: {
        orderNumber,
        storeId,
        customerId:     cust?.id ?? null,
        status:         'completed',
        subtotal,
        taxAmount:      taxAmt,
        discountAmount: discAmt,
        totalAmount:    total,
        paymentMethod:  payMethod,
        amountTendered: tendered,
        changeDue:      change,
        createdAt,
        items: { create: lines },
        payments: {
          create: [{
            method:    payMethod,
            amount:    total,
            reference: payMethod !== 'cash' ? `TXN-${Date.now()}-${i}` : null,
            status:    'completed',
            createdAt,
          }],
        },
      },
    })
    ordersCreated++
  }
  console.log(`   + ${ordersCreated} historical orders created`)

  // ── 9. JOURNAL ENTRIES ─────────────────────────────────────────────────────
  console.log('\n[9/9] Seeding journal entries...')

  const cashAcct    = accountMap['1000']
  const arAcct      = accountMap['1100']
  const salesAcct   = accountMap['4000']
  const cogsAcct    = accountMap['5000']
  const invAcct     = accountMap['1200']
  const payrollAcct = accountMap['6000']
  const payTaxAcct  = accountMap['2200']
  const ccFeeAcct   = accountMap['6330']
  const rentAcct    = accountMap['6100']
  const apAcct      = accountMap['2000']
  const utilAcct    = accountMap['6110']
  const mktAcct     = accountMap['6200']

  // Only create entries if we have the core accounts
  if (!cashAcct || !salesAcct || !cogsAcct) {
    console.log('   ! Core accounts missing - skipping journal entries')
  } else {
    const journalDefs = [
      // Daily sales entries
      { ref: 'JE-2026-001', desc: 'Daily sales summary - Jan 15', date: daysAgo(90),
        lines: [{ acct: '1000', dr: 8450,  cr: 0 }, { acct: '4000', dr: 0, cr: 8450  }] },
      { ref: 'JE-2026-002', desc: 'COGS entry - Jan 15 sales',    date: daysAgo(90),
        lines: [{ acct: '5000', dr: 4225,  cr: 0 }, { acct: '1200', dr: 0, cr: 4225  }] },
      { ref: 'JE-2026-003', desc: 'Daily sales summary - Jan 22', date: daysAgo(83),
        lines: [{ acct: '1000', dr: 11200, cr: 0 }, { acct: '4000', dr: 0, cr: 11200 }] },
      { ref: 'JE-2026-004', desc: 'COGS entry - Jan 22 sales',    date: daysAgo(83),
        lines: [{ acct: '5000', dr: 5600,  cr: 0 }, { acct: '1200', dr: 0, cr: 5600  }] },
      // Monthly payroll
      { ref: 'JE-2026-005', desc: 'Payroll - January 2026', date: daysAgo(76),
        lines: [{ acct: '6000', dr: 42000, cr: 0 }, { acct: '2200', dr: 0, cr: 8400  }, { acct: '1000', dr: 0, cr: 33600 }] },
      // Rent payment
      { ref: 'JE-2026-006', desc: 'Rent expense - February 2026', date: daysAgo(75),
        lines: [{ acct: '6100', dr: 8500, cr: 0 }, { acct: '1000', dr: 0, cr: 8500 }] },
      // Utilities
      { ref: 'JE-2026-007', desc: 'Utilities - February 2026', date: daysAgo(70),
        lines: [{ acct: '6110', dr: 1850, cr: 0 }, { acct: '1000', dr: 0, cr: 1850 }] },
      // Sales entries Feb
      { ref: 'JE-2026-008', desc: 'Daily sales summary - Feb 5', date: daysAgo(65),
        lines: [{ acct: '1000', dr: 9800, cr: 0 }, { acct: '4000', dr: 0, cr: 9800 }] },
      { ref: 'JE-2026-009', desc: 'COGS entry - Feb 5 sales', date: daysAgo(65),
        lines: [{ acct: '5000', dr: 4900, cr: 0 }, { acct: '1200', dr: 0, cr: 4900 }] },
      // Purchase payment
      { ref: 'JE-2026-010', desc: 'Supplier payment - Pacific NW Distributors', date: daysAgo(60),
        lines: [{ acct: '2000', dr: 15600, cr: 0 }, { acct: '1000', dr: 0, cr: 15600 }] },
      // Credit card fees
      { ref: 'JE-2026-011', desc: 'Credit card processing fees - February', date: daysAgo(58),
        lines: [{ acct: '6330', dr: 420, cr: 0 }, { acct: '1000', dr: 0, cr: 420 }] },
      // Monthly payroll March
      { ref: 'JE-2026-012', desc: 'Payroll - February 2026', date: daysAgo(45),
        lines: [{ acct: '6000', dr: 43500, cr: 0 }, { acct: '2200', dr: 0, cr: 8700 }, { acct: '1000', dr: 0, cr: 34800 }] },
      // Inventory purchase (received goods)
      { ref: 'JE-2026-013', desc: 'Inventory received - PO-2026-0003', date: daysAgo(44),
        lines: [{ acct: '1200', dr: 22400, cr: 0 }, { acct: '2000', dr: 0, cr: 22400 }] },
      // Sales March
      { ref: 'JE-2026-014', desc: 'Weekly sales summary - Mar 10', date: daysAgo(41),
        lines: [{ acct: '1000', dr: 38500, cr: 0 }, { acct: '4000', dr: 0, cr: 38500 }] },
      { ref: 'JE-2026-015', desc: 'COGS entry - Mar 10 weekly', date: daysAgo(41),
        lines: [{ acct: '5000', dr: 19250, cr: 0 }, { acct: '1200', dr: 0, cr: 19250 }] },
      // Rent March
      { ref: 'JE-2026-016', desc: 'Rent expense - March 2026', date: daysAgo(40),
        lines: [{ acct: '6100', dr: 8500, cr: 0 }, { acct: '1000', dr: 0, cr: 8500 }] },
      // Marketing spend
      { ref: 'JE-2026-017', desc: 'Marketing campaign - Spring sale ads', date: daysAgo(35),
        lines: [{ acct: '6200', dr: 3200, cr: 0 }, { acct: '1000', dr: 0, cr: 3200 }] },
      // Sales returns
      { ref: 'JE-2026-018', desc: 'Sales returns processing - March', date: daysAgo(30),
        lines: [{ acct: '4300', dr: 1250, cr: 0 }, { acct: '1000', dr: 0, cr: 1250 }] },
      // Recent sales
      { ref: 'JE-2026-019', desc: 'Weekly sales summary - Apr 8', date: daysAgo(13),
        lines: [{ acct: '1000', dr: 42100, cr: 0 }, { acct: '4000', dr: 0, cr: 42100 }] },
      { ref: 'JE-2026-020', desc: 'COGS entry - Apr 8 weekly', date: daysAgo(13),
        lines: [{ acct: '5000', dr: 21050, cr: 0 }, { acct: '1200', dr: 0, cr: 21050 }] },
    ]

    let jeCreated = 0
    for (const jeDef of journalDefs) {
      const existing = await prisma.journalEntry.findFirst({ where: { reference: jeDef.ref } })
      if (existing) continue

      // Build lines - look up accountId from accountMap
      const lineData = []
      for (const l of jeDef.lines) {
        const acct = accountMap[l.acct]
        if (!acct) continue
        lineData.push({ accountId: acct.id, debit: l.dr, credit: l.cr, memo: jeDef.desc })
      }
      if (lineData.length < 2) continue

      await prisma.journalEntry.create({
        data: {
          reference:   jeDef.ref,
          description: jeDef.desc,
          date:        jeDef.date,
          status:      'posted',
          lines:       { create: lineData },
        },
      })
      jeCreated++
    }
    console.log(`   + ${jeCreated} journal entries created`)
  }

  // ── Final counts ───────────────────────────────────────────────────────────
  console.log('\n' + '='.repeat(60))
  console.log('  SEED COMPLETE — Final DB Counts')
  console.log('='.repeat(60))

  const counts = await Promise.all([
    prisma.employee.count(),
    prisma.loyaltyProgram.count(),
    prisma.loyaltyCard.count(),
    prisma.giftCard.count(),
    prisma.account.count(),
    prisma.budgetPlan.count(),
    prisma.purchaseOrder.count(),
    prisma.serviceCase.count(),
    prisma.order.count(),
    prisma.journalEntry.count(),
    prisma.customer.count(),
    prisma.supplier.count(),
    prisma.product.count(),
    prisma.store.count(),
    prisma.user.count(),
    prisma.loyaltyTier.count(),
    prisma.giftCardTransaction.count(),
    prisma.journalLine.count(),
    prisma.budgetEntry.count(),
    prisma.purchaseOrderItem.count(),
  ])

  const labels = [
    'Employees', 'Loyalty Programs', 'Loyalty Cards', 'Gift Cards',
    'GL Accounts', 'Budget Plans', 'Purchase Orders', 'Service Cases',
    'Orders (total)', 'Journal Entries', 'Customers', 'Suppliers',
    'Products', 'Stores', 'Users', 'Loyalty Tiers',
    'Gift Card Transactions', 'Journal Lines', 'Budget Entries', 'PO Line Items',
  ]

  labels.forEach((label, i) => {
    console.log(`  ${label.padEnd(28)} ${counts[i]}`)
  })
  console.log('='.repeat(60))
}

main()
  .catch(err => { console.error('SEED ERROR:', err); process.exit(1) })
  .finally(() => prisma.$disconnect())
