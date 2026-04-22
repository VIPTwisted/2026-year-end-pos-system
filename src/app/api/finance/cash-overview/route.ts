import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  const data = {
    kpis: {
      totalCash: 14847293,
      availableForUse: 12203441,
      restrictedCash: 644852,
      forecastedInflow: 3201000,
      forecastedOutflow: 2876500,
    },
    accounts: [
      { id: 1, account: 'Checking-001',  bank: 'JPMorgan Chase',  currency: 'USD', balance: 5234100,  status: 'Active'     },
      { id: 2, account: 'Checking-002',  bank: 'Bank of America', currency: 'USD', balance: 2967341,  status: 'Active'     },
      { id: 3, account: 'Payroll-001',   bank: 'Wells Fargo',     currency: 'USD', balance: 1001000,  status: 'Active'     },
      { id: 4, account: 'Euro-Main',     bank: 'Deutsche Bank',   currency: 'EUR', balance: 891200,   status: 'Active'     },
      { id: 5, account: 'GBP-Ops',       bank: 'HSBC',            currency: 'GBP', balance: 412850,   status: 'Active'     },
      { id: 6, account: 'Reserve-001',   bank: 'Citibank',        currency: 'USD', balance: 644852,   status: 'Restricted' },
      { id: 7, account: 'Money Market',  bank: 'Fidelity',        currency: 'USD', balance: 3188850,  status: 'Active'     },
      { id: 8, account: 'Petty Cash',    bank: 'Internal',        currency: 'USD', balance: 8100,     status: 'Active'     },
    ],
    transfers: [
      { id: 1, from: 'Checking-001', to: 'Payroll-001', amount: 250000,  date: '2026-04-25', status: 'Pending'  },
      { id: 2, from: 'Money Market', to: 'Checking-002', amount: 500000, date: '2026-04-23', status: 'Approved' },
      { id: 3, from: 'Euro-Main',    to: 'Checking-001', amount: 120000, date: '2026-04-24', status: 'Pending'  },
    ],
    cashByEntity: [
      { entity: 'USMF', available: 8200000, restricted: 320000 },
      { entity: 'USRT', available: 3100000, restricted: 180000 },
      { entity: 'DEMF', available: 1900000, restricted: 90000  },
      { entity: 'GBSI', available: 800000,  restricted: 54852  },
    ],
    cashFlow30Days: Array.from({ length: 30 }, (_, i) => ({
      day: i + 1,
      inflow:  1200000 + Math.sin(i * 0.4) * 800000 + (i % 7 === 0 ? 1200000 : 0),
      outflow: 900000  + Math.cos(i * 0.35) * 600000 + (i % 5 === 0 ? 900000 : 0),
    })),
  }

  return NextResponse.json(data)
}
