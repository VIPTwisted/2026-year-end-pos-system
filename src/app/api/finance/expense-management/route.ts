import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const EXPENSE_REPORTS = [
  {
    id: 'exp-001',
    reportNumber: 'ER-2026-0041',
    employee: 'Sarah Chen',
    purpose: 'Q1 Sales Conference — Chicago',
    total: 2840.50,
    status: 'Approved',
    submitted: '2026-03-28',
    policyViolations: 0,
  },
  {
    id: 'exp-002',
    reportNumber: 'ER-2026-0042',
    employee: 'James Rivera',
    purpose: 'Supplier Visit — Dallas',
    total: 1125.00,
    status: 'In Review',
    submitted: '2026-04-05',
    policyViolations: 1,
  },
  {
    id: 'exp-003',
    reportNumber: 'ER-2026-0043',
    employee: 'Priya Nair',
    purpose: 'Training & Certification — Remote',
    total: 450.00,
    status: 'Submitted',
    submitted: '2026-04-10',
    policyViolations: 0,
  },
  {
    id: 'exp-004',
    reportNumber: 'ER-2026-0044',
    employee: 'Marcus Lee',
    purpose: 'Client Dinner — NYC',
    total: 680.25,
    status: 'Returned',
    submitted: '2026-04-12',
    policyViolations: 2,
  },
  {
    id: 'exp-005',
    reportNumber: 'ER-2026-0045',
    employee: 'Aisha Johnson',
    purpose: 'Office Supplies Q2',
    total: 312.80,
    status: 'Draft',
    submitted: null,
    policyViolations: 0,
  },
  {
    id: 'exp-006',
    reportNumber: 'ER-2026-0046',
    employee: 'Tom Nguyen',
    purpose: 'Trade Show Booth — Las Vegas',
    total: 5220.00,
    status: 'Paid',
    submitted: '2026-03-15',
    policyViolations: 0,
  },
]

const KPI = {
  myOpenExpenses: 4,
  awaitingApproval: 2,
  returnedForCorrection: 1,
  approvedThisMonth: 8,
}

const EXPENSE_LIMITS = [
  { category: 'Meals & Entertainment', limit: 75, per: 'day' },
  { category: 'Hotel / Lodging', limit: 250, per: 'night' },
  { category: 'Air Travel', limit: 800, per: 'trip' },
  { category: 'Ground Transport', limit: 150, per: 'day' },
  { category: 'Office Supplies', limit: 500, per: 'month' },
]

export async function GET() {
  return NextResponse.json({ kpi: KPI, reports: EXPENSE_REPORTS, expenseLimits: EXPENSE_LIMITS })
}

export async function POST(req: Request) {
  const body = await req.json()
  const created = {
    id: `exp-${Date.now()}`,
    reportNumber: `ER-2026-${String(Math.floor(Math.random() * 9000) + 1000)}`,
    employee: body.employee ?? 'Unknown',
    purpose: body.purpose ?? '',
    total: body.total ?? 0,
    status: 'Draft',
    submitted: null,
    policyViolations: 0,
  }
  return NextResponse.json(created, { status: 201 })
}
