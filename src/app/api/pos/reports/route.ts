import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const DAILY_SUMMARY = {
  date: '2026-04-22',
  store: 'Main Street Store #001',
  generatedBy: 'System',
  generatedAt: '10:45 AM',
  kpis: {
    totalSales: 8247.32,
    transactions: 127,
    avgTicket: 64.94,
    returns: 124.48,
  },
  byRegister: [
    { register: 'Register 1', cashier: 'Sarah M.',  transactions: 38, total: 2841.20 },
    { register: 'Register 2', cashier: 'James C.',  transactions: 31, total: 2204.80 },
    { register: 'Register 3', cashier: 'Lisa P.',   transactions: 34, total: 1984.61 },
    { register: 'Register 4', cashier: 'Carlos R.', transactions: 24, total: 1216.71 },
  ],
  byTender: [
    { type: 'Cash',      amount: 2841.20, pct: 34 },
    { type: 'Card',      amount: 4892.41, pct: 59 },
    { type: 'Gift Card', amount: 513.71,  pct: 7  },
  ],
  hourly: [
    { hour: '9AM',  sales: 842  },
    { hour: '10AM', sales: 1240 },
    { hour: '11AM', sales: 980  },
    { hour: '12PM', sales: 1480 },
    { hour: '1PM',  sales: 1120 },
    { hour: '2PM',  sales: 760  },
    { hour: '3PM',  sales: 940  },
    { hour: '4PM',  sales: 1320 },
    { hour: '5PM',  sales: 1580 },
    { hour: '6PM',  sales: 1200 },
    { hour: '7PM',  sales: 840  },
    { hour: '8PM',  sales: 720  },
    { hour: '9PM',  sales: 480  },
  ],
}

const REPORT_CATEGORIES = [
  { name: 'Sales Reports',         count: 8 },
  { name: 'Cash & Drawer Reports', count: 4 },
  { name: 'Inventory Reports',     count: 3 },
  { name: 'Employee Reports',      count: 4 },
  { name: 'Return Reports',        count: 3 },
  { name: 'Tax Reports',           count: 2 },
  { name: 'Customer Reports',      count: 3 },
]

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const report = searchParams.get('report') ?? 'daily-sales-summary'

  if (report === 'daily-sales-summary') {
    return NextResponse.json({ report: 'daily-sales-summary', data: DAILY_SUMMARY })
  }

  return NextResponse.json({ categories: REPORT_CATEGORIES, message: `Report "${report}" data would be returned here` })
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  return NextResponse.json({
    success: true,
    message: `Report "${body.report}" queued for generation`,
    jobId: `JOB-${Date.now()}`,
    estimatedSeconds: 5,
  })
}
