import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  return NextResponse.json({
    // Activities — Row 1: Ongoing Sales
    salesQuotes: 2,
    salesOrders: 4,
    salesInvoices: 7,
    salesThisMonth: 1906,

    // Activities — Row 2: Purchases
    purchaseOrders: 4,
    ongoingPurchaseInvoices: 3,
    overduePurchInvoiceAmount: 49422,
    purchInvoicesDueNextWeek: 0,

    // Activities — Row 3: Payments + Incoming Documents
    overdueSalesInvoiceAmount: 63890,
    unprocessedPayments: 1,
    avgCollectionDays: 0.0,
    myIncomingDocuments: 0,

    // Start section quick-action tiles
    startTiles: [
      { label: 'New Customer',       icon: 'user-plus',    href: '/customers/new' },
      { label: 'New Sales Order',    icon: 'shopping-cart', href: '/sales/orders/new' },
      { label: 'New Sales Invoice',  icon: 'file-text',    href: '/sales/invoices/new' },
      { label: 'New Purchase Order', icon: 'package',      href: '/purchasing/new' },
    ],

    // Top 5 customers by sales value (pie chart)
    topCustomers: [
      { name: 'Litware Inc.',         value: 48200, color: '#3b82f6' },
      { name: 'Coho Winery',          value: 35600, color: '#ef4444' },
      { name: 'Relecloud',            value: 27900, color: '#10b981' },
      { name: 'Alpine Ski House',     value: 19400, color: '#8b5cf6' },
      { name: 'Trey Research',        value: 14100, color: '#0097b2' },
      { name: 'All Other Customers',  value: 9800,  color: '#f59e0b' },
    ],
  })
}
