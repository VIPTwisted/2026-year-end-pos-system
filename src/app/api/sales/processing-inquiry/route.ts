import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  return NextResponse.json({
    summary: {
      openOrders: 284,
      toInvoice: 47,
      backorders: 12,
      unconfirmed: 8,
      myOrders: 31,
      quotations: 156,
    },
    pipeline: [
      { stage: 'Quotes', count: 156 },
      { stage: 'Confirmed', count: 284 },
      { stage: 'Shipped', count: 201 },
      { stage: 'Invoiced', count: 47 },
    ],
    attention: [
      { order: 'SO-2026-4812', customer: 'Fabrikam Inc', date: 'Apr 15', amount: 24300, issue: 'Credit hold' },
      { order: 'SO-2026-4891', customer: 'Adatum Corp', date: 'Apr 18', amount: 8750, issue: 'Awaiting stock' },
      { order: 'SO-2026-4902', customer: 'Contoso Ltd', date: 'Apr 19', amount: 156000, issue: 'Pending approval' },
      { order: 'SO-2026-4915', customer: 'Trey Research', date: 'Apr 20', amount: 3200, issue: 'Address invalid' },
      { order: 'SO-2026-4921', customer: 'Litware Inc', date: 'Apr 20', amount: 47600, issue: 'Payment dispute' },
      { order: 'SO-2026-4933', customer: 'Northwind Traders', date: 'Apr 21', amount: 12875, issue: 'Credit hold' },
      { order: 'SO-2026-4940', customer: 'Alpine Ski House', date: 'Apr 21', amount: 5490, issue: 'Expired quote' },
      { order: 'SO-2026-4947', customer: 'Wide World Importers', date: 'Apr 22', amount: 88100, issue: 'Fraud review' },
    ],
    repSales: [
      { name: 'Alice Chen', amount: 284300 },
      { name: 'Bob Wilson', amount: 241750 },
      { name: 'Carlos Mendez', amount: 198200 },
      { name: 'Sarah Lopez', amount: 162400 },
      { name: 'John Smith', amount: 134800 },
      { name: 'Dana Park', amount: 97600 },
    ],
  })
}
