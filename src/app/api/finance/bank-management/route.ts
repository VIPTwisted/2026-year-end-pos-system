export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    accounts: [
      { id: 'BA-001', bank: 'JPMorgan Chase', type: 'Checking', currency: 'USD', book: 5234100, bankBal: 5234100, diff: 0, reconciled: 'Apr 20' },
      { id: 'BA-002', bank: 'Bank of America', type: 'Checking', currency: 'USD', book: 2967341, bankBal: 2972000, diff: -4659, reconciled: 'Apr 18' },
      { id: 'BA-003', bank: 'Wells Fargo', type: 'Payroll', currency: 'USD', book: 1001000, bankBal: 1001000, diff: 0, reconciled: 'Apr 22' },
      { id: 'BA-004', bank: 'Deutsche Bank', type: 'Checking', currency: 'EUR', book: 891200, bankBal: 891200, diff: 0, reconciled: 'Apr 19' },
      { id: 'BA-005', bank: 'HSBC', type: 'GBP', currency: 'GBP', book: 412850, bankBal: 415200, diff: -2350, reconciled: 'Apr 15' },
    ],
    summary: {
      totalAccounts: 8,
      pendingReconciliation: 3,
      unmatchedTransactions: 27,
      electronicPayments: 12,
      positivePayFiles: 2,
    },
    forecast: {
      days: ['Apr 22', 'Apr 23', 'Apr 24', 'Apr 25', 'Apr 26', 'Apr 27', 'Apr 28', 'Apr 29', 'Apr 30', 'May 1', 'May 2', 'May 3', 'May 4', 'May 5'],
      inflows: [125000, 89300, 210000, 45000, 320000, 0, 0, 175000, 98000, 450000, 120000, 0, 0, 88000],
      outflows: [48200, 312480, 22650, 95000, 180000, 0, 0, 85000, 420000, 65000, 38000, 0, 0, 72000],
    },
  })
}
