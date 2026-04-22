import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  return NextResponse.json({
    kpi: {
      lastRun: 'Apr 21, 2026',
      companiesConsolidated: 4,
      eliminationEntries: 23,
      intercompanyDifferences: 1240,
    },
    consolidationGroup: {
      parent: { name: 'NovaPOS Holdings', currency: 'USD' },
      companies: [
        { code: 'USMF', name: 'Contoso US', currency: 'USD', converted: null, ownership: '100%', status: 'Included' },
        { code: 'USRT', name: 'Contoso Retail', currency: 'USD', converted: null, ownership: '100%', status: 'Included' },
        { code: 'DEMF', name: 'Contoso DE', currency: 'EUR', converted: 'USD', ownership: '100%', status: 'Included' },
        { code: 'GBSI', name: 'Contoso UK', currency: 'GBP', converted: 'USD', ownership: '100%', status: 'Included' },
      ],
    },
    runHistory: [
      { date: 'Apr 21, 2026', period: 'Apr 2026', companies: 4, eliminations: 23, status: 'Completed', user: 'jsmith' },
      { date: 'Mar 31, 2026', period: 'Mar 2026', companies: 4, eliminations: 19, status: 'Completed', user: 'jsmith' },
      { date: 'Feb 28, 2026', period: 'Feb 2026', companies: 4, eliminations: 21, status: 'Completed', user: 'adavis' },
      { date: 'Jan 31, 2026', period: 'Jan 2026', companies: 4, eliminations: 18, status: 'Completed', user: 'adavis' },
      { date: 'Dec 31, 2025', period: 'Dec 2025', companies: 4, eliminations: 27, status: 'Completed', user: 'jsmith' },
    ],
    eliminations: [
      { account: '13100 – IC Receivable USMF', debit: 0, credit: 284200, description: 'USMF → DEMF interco offset' },
      { account: '21300 – IC Payable DEMF', debit: 284200, credit: 0, description: 'DEMF → USMF interco offset' },
      { account: '40100 – IC Revenue USRT', debit: 192400, credit: 0, description: 'USRT interco revenue elim.' },
      { account: '50200 – IC COGS GBSI', debit: 0, credit: 192400, description: 'GBSI interco COGS elim.' },
      { account: '39000 – Investment in Sub', debit: 0, credit: 519000, description: 'Subsidiary equity elim.' },
    ],
    exchangeRates: [
      { pair: 'EUR/USD', rate: 1.0842, variance: '+0.32%' },
      { pair: 'GBP/USD', rate: 1.2634, variance: '-0.18%' },
      { pair: 'CAD/USD', rate: 0.7398, variance: '+0.07%' },
    ],
  })
}
