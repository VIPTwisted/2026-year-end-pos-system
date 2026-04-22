import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const BUDGETS = [
  {
    id: 'bgt-001',
    code: 'FY2026-OPS',
    description: 'Operations & Facilities',
    ledger: 'Main Ledger',
    fiscalYear: 'FY2026',
    totalBudget: 500000,
    committed: 185000,
    actual: 312400,
    status: 'Active',
    workflow: 'Approved',
  },
  {
    id: 'bgt-002',
    code: 'FY2026-CAPEX',
    description: 'Capital Expenditures',
    ledger: 'Capital Ledger',
    fiscalYear: 'FY2026',
    totalBudget: 1200000,
    committed: 640000,
    actual: 487500,
    status: 'Active',
    workflow: 'Approved',
  },
  {
    id: 'bgt-003',
    code: 'FY2026-HR',
    description: 'Human Resources & Payroll',
    ledger: 'Main Ledger',
    fiscalYear: 'FY2026',
    totalBudget: 300000,
    committed: 280000,
    actual: 298700,
    status: 'Over Budget',
    workflow: 'Approved',
  },
  {
    id: 'bgt-004',
    code: 'FY2026-IT',
    description: 'Information Technology',
    ledger: 'Main Ledger',
    fiscalYear: 'FY2026',
    totalBudget: 150000,
    committed: 62000,
    actual: 71200,
    status: 'Active',
    workflow: 'In Review',
  },
  {
    id: 'bgt-005',
    code: 'FY2026-MKTG',
    description: 'Marketing & Advertising',
    ledger: 'Main Ledger',
    fiscalYear: 'FY2026',
    totalBudget: 80000,
    committed: 18500,
    actual: 22100,
    status: 'Draft',
    workflow: 'Pending',
  },
]

const SUMMARY = {
  budgetPlansCount: 3,
  budgetRegistersCount: 12,
  overbudgetAlerts: 2,
  pendingApprovals: 1,
}

export async function GET() {
  const budgets = BUDGETS.map(b => ({
    ...b,
    remaining: b.totalBudget - b.actual,
  }))
  return NextResponse.json({ summary: SUMMARY, budgets })
}

export async function POST(req: Request) {
  const body = await req.json()
  const created = {
    id: `bgt-${Date.now()}`,
    code: body.code ?? 'NEW-BUDGET',
    description: body.description ?? '',
    ledger: body.ledger ?? 'Main Ledger',
    fiscalYear: body.fiscalYear ?? 'FY2026',
    totalBudget: body.totalBudget ?? 0,
    committed: 0,
    actual: 0,
    remaining: body.totalBudget ?? 0,
    status: 'Draft',
    workflow: 'Pending',
  }
  return NextResponse.json(created, { status: 201 })
}
