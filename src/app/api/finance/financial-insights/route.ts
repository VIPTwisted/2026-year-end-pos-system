import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  const data = {
    kpis: {
      revenueYTD:       { value: 47200000,  change: 8.3,   unit: '$' },
      grossMargin:      { value: 38.4,       change: 1.2,   unit: '%' },
      operatingExpenses:{ value: 12800000,  change: -2.1,  unit: '$' },
      netIncome:        { value: 5900000,   change: 14.7,  unit: '$' },
    },
    sparklines: {
      revenueYTD:        [3.2,3.5,3.8,4.1,3.9,4.4,4.6,4.8],
      grossMargin:       [36.1,36.8,37.2,37.5,37.9,38.1,38.3,38.4],
      operatingExpenses: [14.1,13.8,13.5,13.2,13.0,12.9,12.8,12.8],
      netIncome:         [3.8,4.1,4.4,4.7,5.0,5.3,5.7,5.9],
    },
    revenueBudget: [
      { month: 'Nov', actual: 6800000,  budget: 6500000  },
      { month: 'Dec', actual: 7200000,  budget: 7000000  },
      { month: 'Jan', actual: 6100000,  budget: 6300000  },
      { month: 'Feb', actual: 6500000,  budget: 6400000  },
      { month: 'Mar', actual: 7100000,  budget: 6900000  },
      { month: 'Apr', actual: 6900000,  budget: 7100000  },
    ],
    expenseBreakdown: [
      { label: 'COGS',  value: 42, color: '#4f46e5' },
      { label: 'SG&A',  value: 28, color: '#0d9488' },
      { label: 'R&D',   value: 12, color: '#d97706' },
      { label: 'D&A',   value: 10, color: '#db2777' },
      { label: 'Other', value: 8,  color: '#6366f1' },
    ],
    profitabilityByBU: [
      { bu: 'Manufacturing', profit: 2100000 },
      { bu: 'Retail',        profit: 1800000 },
      { bu: 'Services',      profit: 1300000 },
      { bu: 'Distribution',  profit: 900000  },
      { bu: 'Other',         profit: 200000  },
    ],
    workingCapital: Array.from({ length: 12 }, (_, i) => ({
      month: ['May','Jun','Jul','Aug','Sep','Oct','Nov','Dec','Jan','Feb','Mar','Apr'][i],
      currentAssets:      18000000 + i * 400000 + (i % 3 === 0 ? 600000 : 0),
      currentLiabilities: 12000000 + i * 250000 + (i % 4 === 0 ? 400000 : 0),
    })),
    keyRatios: [
      { label: 'Current Ratio',      value: '2.34', health: 'green' },
      { label: 'Quick Ratio',         value: '1.87', health: 'green' },
      { label: 'Debt-to-Equity',      value: '0.42', health: 'green' },
      { label: 'Return on Assets',    value: '8.2%', health: 'green' },
      { label: 'Return on Equity',    value: '14.7%',health: 'green' },
      { label: 'Inventory Turnover',  value: '6.8x', health: 'amber' },
    ],
    recentJournals: [
      { date: '2026-04-22', account: '110100 · Cash',              debit: 5234100, credit: 0,       posted: true  },
      { date: '2026-04-21', account: '400100 · Revenue',           debit: 0,       credit: 682400,  posted: true  },
      { date: '2026-04-21', account: '501000 · COGS',              debit: 286600,  credit: 0,       posted: true  },
      { date: '2026-04-20', account: '200100 · Accounts Payable',  debit: 0,       credit: 142800,  posted: true  },
      { date: '2026-04-19', account: '610100 · SG&A Expense',      debit: 98400,   credit: 0,       posted: false },
    ],
  }

  return NextResponse.json(data)
}
