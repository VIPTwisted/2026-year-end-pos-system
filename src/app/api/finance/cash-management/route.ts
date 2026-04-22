import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// Static mock data — swap prisma queries in once BankTransaction model is confirmed in schema

const BANK_ACCOUNTS = [
  { id: '1', code: 'CHECKING-USD',  name: 'Primary Checking',  currency: 'USD', currentBalance: 485230.50, lastReconciled: '2026-04-15', outstanding: 12400.00, available: 472830.50 },
  { id: '2', code: 'SAVINGS-USD',   name: 'Operating Savings',  currency: 'USD', currentBalance: 312750.00, lastReconciled: '2026-04-10', outstanding: 0,        available: 312750.00 },
  { id: '3', code: 'PAYROLL-USD',   name: 'Payroll Account',    currency: 'USD', currentBalance:  98400.00, lastReconciled: '2026-04-18', outstanding: 4200.00,  available:  94200.00 },
  { id: '4', code: 'OPERATING-EUR', name: 'EU Operations',      currency: 'EUR', currentBalance: 187600.00, lastReconciled: '2026-04-12', outstanding: 9800.00,  available: 177800.00 },
  { id: '5', code: 'RESERVES-USD',  name: 'Capital Reserves',   currency: 'USD', currentBalance: 116019.50, lastReconciled: '2026-04-01', outstanding: 0,        available: 116019.50 },
]

const TRANSACTIONS = [
  { id: 't1',  date: '2026-04-22', type: 'ACH',     description: 'Vendor Payment – Acme Supply Co.', amount: -14250.00, bankAccount: 'CHECKING-USD',  status: 'Posted'  },
  { id: 't2',  date: '2026-04-22', type: 'Deposit', description: 'Customer Receipt – INV-2841',      amount:  32100.00, bankAccount: 'CHECKING-USD',  status: 'Posted'  },
  { id: 't3',  date: '2026-04-21', type: 'Wire',    description: 'Outbound Wire – EU Supplier',      amount: -55000.00, bankAccount: 'OPERATING-EUR', status: 'Posted'  },
  { id: 't4',  date: '2026-04-21', type: 'EFT',     description: 'Payroll Run – Period 8',           amount: -87600.00, bankAccount: 'PAYROLL-USD',   status: 'Posted'  },
  { id: 't5',  date: '2026-04-20', type: 'Check',   description: 'Check #4421 – Rent Payment',       amount: -12500.00, bankAccount: 'CHECKING-USD',  status: 'Posted'  },
  { id: 't6',  date: '2026-04-20', type: 'ACH',     description: 'Customer Payment – PO-1142',       amount:  18900.00, bankAccount: 'CHECKING-USD',  status: 'Pending' },
  { id: 't7',  date: '2026-04-19', type: 'Deposit', description: 'Cash Deposit – Store #12',          amount:   4820.00, bankAccount: 'CHECKING-USD',  status: 'Posted'  },
  { id: 't8',  date: '2026-04-19', type: 'EFT',     description: 'Utilities – April Invoice',         amount:  -3240.00, bankAccount: 'CHECKING-USD',  status: 'Posted'  },
  { id: 't9',  date: '2026-04-18', type: 'Wire',    description: 'Wire – Capital Reserves Transfer',  amount:  50000.00, bankAccount: 'RESERVES-USD',  status: 'Pending' },
  { id: 't10', date: '2026-04-17', type: 'Check',   description: 'Check #4398 – Voided Duplicate',    amount:  -8750.00, bankAccount: 'CHECKING-USD',  status: 'Voided'  },
]

export async function GET(_req: NextRequest) {
  const summary = {
    bankAccountsTotal: 5,
    activeBankAccounts: 4,
    outstandingPayments: 12,
    outstandingDeposits: 3,
    statementsToReconcile: 7,
    reconciledLast7Days: 2,
    unprocessedVendorPayments: 2,
    electronicPaymentsToSend: 1,
    paymentsRequiringAttention: 0,
    cashPositionToday: 1200000,
    forecastedCash30Days: 890000,
  }

  return NextResponse.json({
    summary,
    bankAccounts: BANK_ACCOUNTS,
    transactions: TRANSACTIONS,
  })
}
