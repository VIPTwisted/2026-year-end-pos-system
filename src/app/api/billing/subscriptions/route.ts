import { NextRequest, NextResponse } from 'next/server'

// Billing Subscriptions API
// Backed by mock data until BillingSubscription schema is added to Prisma

const MOCK_SUBS = [
  { id: 'SUB-0001', contractNo: 'SUB-0001', customer: 'Acme Corp', item: 'PRO-PLAN-001', billingPeriod: 'Monthly', startDate: '2026-01-01', nextInvoiceDate: '2026-05-01', status: 'Active', amount: 299.00 },
  { id: 'SUB-0002', contractNo: 'SUB-0002', customer: 'Globex Industries', item: 'ENT-PLAN-002', billingPeriod: 'Annually', startDate: '2026-01-15', nextInvoiceDate: '2027-01-15', status: 'Active', amount: 2988.00 },
  { id: 'SUB-0003', contractNo: 'SUB-0003', customer: 'Springfield LLC', item: 'STD-PLAN-001', billingPeriod: 'Quarterly', startDate: '2026-02-01', nextInvoiceDate: '2026-05-01', status: 'Pending', amount: 597.00 },
]

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status') ?? ''
    const customerId = searchParams.get('customerId') ?? ''

    let subs = MOCK_SUBS
    if (status) subs = subs.filter(s => s.status.toLowerCase() === status.toLowerCase())
    if (customerId) subs = subs.filter(s => s.id === customerId)

    return NextResponse.json({ subscriptions: subs, total: subs.length })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to fetch subscriptions' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { customer, item, billingPeriod, startDate, amount } = body

    if (!customer || !item || !billingPeriod || !startDate) {
      return NextResponse.json(
        { error: 'customer, item, billingPeriod, and startDate are required' },
        { status: 400 }
      )
    }

    // Generate contract number
    const contractNo = `SUB-${Date.now().toString().slice(-4)}`

    const newSub = {
      id: contractNo,
      contractNo,
      customer,
      item,
      billingPeriod,
      startDate,
      nextInvoiceDate: startDate, // calculated server-side in real impl
      status: 'Pending',
      amount: amount ?? 0,
    }

    return NextResponse.json(newSub, { status: 201 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to create subscription' }, { status: 500 })
  }
}
