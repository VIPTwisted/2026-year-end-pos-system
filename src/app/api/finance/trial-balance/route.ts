export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'

const ROWS = [
  { accountNo:'1000', accountName:'Cash and Cash Equivalents',  openingDebit:5000000,  openingCredit:0,        periodDebit:847293,   periodCredit:613193,  closingDebit:5234100,  closingCredit:0        },
  { accountNo:'1100', accountName:'Accounts Receivable',        openingDebit:8100000,  openingCredit:0,        periodDebit:1247400,  periodCredit:915300,  closingDebit:8432100,  closingCredit:0        },
  { accountNo:'1200', accountName:'Inventory',                  openingDebit:4100000,  openingCredit:0,        periodDebit:623000,   periodCredit:504500,  closingDebit:4218500,  closingCredit:0        },
  { accountNo:'1500', accountName:'Property & Equipment',       openingDebit:18400000, openingCredit:0,        periodDebit:0,        periodCredit:0,       closingDebit:18400000, closingCredit:0        },
  { accountNo:'1550', accountName:'Accumulated Depreciation',   openingDebit:0,        openingCredit:4631667,  periodDebit:0,        periodCredit:148333,  closingDebit:0,        closingCredit:4780000  },
  { accountNo:'2000', accountName:'Accounts Payable',           openingDebit:0,        openingCredit:2700000,  periodDebit:812400,   periodCredit:953600,  closingDebit:0,        closingCredit:2841200  },
  { accountNo:'2100', accountName:'Accrued Liabilities',        openingDebit:0,        openingCredit:1103200,  periodDebit:0,        periodCredit:100200,  closingDebit:0,        closingCredit:1203400  },
  { accountNo:'2500', accountName:'Long-Term Debt',             openingDebit:0,        openingCredit:8200000,  periodDebit:0,        periodCredit:0,       closingDebit:0,        closingCredit:8200000  },
  { accountNo:'3000', accountName:'Common Stock',               openingDebit:0,        openingCredit:5000000,  periodDebit:0,        periodCredit:0,       closingDebit:0,        closingCredit:5000000  },
  { accountNo:'3500', accountName:'Retained Earnings',          openingDebit:0,        openingCredit:14260000, periodDebit:0,        periodCredit:0,       closingDebit:0,        closingCredit:14260000 },
  { accountNo:'4000', accountName:'Sales Revenue',              openingDebit:0,        openingCredit:43200000, periodDebit:0,        periodCredit:4000000, closingDebit:0,        closingCredit:47200000 },
  { accountNo:'4100', accountName:'Service Revenue',            openingDebit:0,        openingCredit:3480000,  periodDebit:0,        periodCredit:320000,  closingDebit:0,        closingCredit:3800000  },
  { accountNo:'4900', accountName:'Other Revenue',              openingDebit:0,        openingCredit:380000,   periodDebit:0,        periodCredit:40000,   closingDebit:0,        closingCredit:420000   },
  { accountNo:'5000', accountName:'Cost of Goods Sold',         openingDebit:26720000, openingCredit:0,        periodDebit:2400000,  periodCredit:0,       closingDebit:29120000, closingCredit:0        },
  { accountNo:'6000', accountName:'Salaries & Wages',           openingDebit:7720000,  openingCredit:0,        periodDebit:700000,   periodCredit:0,       closingDebit:8420000,  closingCredit:0        },
  { accountNo:'6100', accountName:'Rent & Occupancy',           openingDebit:1690000,  openingCredit:0,        periodDebit:150000,   periodCredit:0,       closingDebit:1840000,  closingCredit:0        },
  { accountNo:'6200', accountName:'Depreciation',               openingDebit:1631667,  openingCredit:0,        periodDebit:148333,   periodCredit:0,       closingDebit:1780000,  closingCredit:0        },
  { accountNo:'6300', accountName:'Marketing & Advertising',    openingDebit:847000,   openingCredit:0,        periodDebit:77000,    periodCredit:0,       closingDebit:924000,   closingCredit:0        },
  { accountNo:'6900', accountName:'Other Operating Expenses',   openingDebit:1963333,  openingCredit:0,        periodDebit:176667,   periodCredit:0,       closingDebit:2140000,  closingCredit:0        },
  { accountNo:'8000', accountName:'Income Tax Expense',         openingDebit:1669333,  openingCredit:0,        periodDebit:150667,   periodCredit:0,       closingDebit:1820000,  closingCredit:0        },
]

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const period = searchParams.get('period') || 'April 2026'
  const entity = searchParams.get('entity') || 'USMF'

  const totals = ROWS.reduce((acc, r) => ({
    openingDebit:  acc.openingDebit  + r.openingDebit,
    openingCredit: acc.openingCredit + r.openingCredit,
    periodDebit:   acc.periodDebit   + r.periodDebit,
    periodCredit:  acc.periodCredit  + r.periodCredit,
    closingDebit:  acc.closingDebit  + r.closingDebit,
    closingCredit: acc.closingCredit + r.closingCredit,
  }), { openingDebit:0, openingCredit:0, periodDebit:0, periodCredit:0, closingDebit:0, closingCredit:0 })

  return NextResponse.json({
    period,
    entity,
    dateFrom: 'Apr 1, 2026',
    dateTo:   'Apr 30, 2026',
    rows:     ROWS,
    totals,
  })
}
