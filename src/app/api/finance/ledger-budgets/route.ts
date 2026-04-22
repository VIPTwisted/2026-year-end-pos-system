import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  return NextResponse.json({
    budgetPlans: [
      { id: 1, plan: 'Annual Operating 2026', year: '2026', status: 'Approved', total: 48200000, spent: 18700000, remaining: 29500000, pct: 38.8 },
      { id: 2, plan: 'Capital Expenditure', year: '2026', status: 'Approved', total: 12000000, spent: 4200000, remaining: 7800000, pct: 35.0 },
      { id: 3, plan: 'R&D Initiative', year: '2026', status: 'Under Review', total: 6500000, spent: 1100000, remaining: 5400000, pct: 16.9 },
      { id: 4, plan: 'Emergency Reserve', year: '2026', status: 'Approved', total: 2000000, spent: 300000, remaining: 1700000, pct: 15.0 },
      { id: 5, plan: 'Marketing Campaign', year: 'Q2 2026', status: 'Draft', total: 1800000, spent: 0, remaining: 1800000, pct: 0 },
    ],
    deptData: [
      { dept: 'Finance', budget: 3200000, actual: 2100000 },
      { dept: 'Operations', budget: 4800000, actual: 3900000 },
      { dept: 'Sales', budget: 4200000, actual: 3100000 },
      { dept: 'Marketing', budget: 1800000, actual: 1584000 },
      { dept: 'IT', budget: 2600000, actual: 2392000 },
      { dept: 'HR', budget: 1400000, actual: 890000 },
    ],
    alerts: [
      { dept: 'IT', pct: 92, severity: 'red' },
      { dept: 'Marketing', pct: 88, severity: 'amber' },
      { dept: 'Travel', pct: 74, severity: 'amber' },
    ],
    forecastAccuracy: [
      { cat: 'Revenue', forecast: 48.2, actual: 46.8 },
      { cat: 'OpEx', forecast: 32.1, actual: 33.4 },
      { cat: 'CapEx', forecast: 12.0, actual: 11.3 },
      { cat: 'Headcount', forecast: 8.5, actual: 8.7 },
    ],
    summary: {
      allBudgetPlans: 12,
      myBudgetPlans: 3,
      awaitingApproval: 2,
      budgetRegisterEntries: 847,
      forecastPositions: 156,
    },
  })
}
