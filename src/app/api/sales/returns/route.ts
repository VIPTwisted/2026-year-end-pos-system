export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status') || 'All'
  const customer = searchParams.get('customer') || ''
  const reason = searchParams.get('reason') || ''
  const search = searchParams.get('search') || ''

  // Static mock data — replace with prisma queries when schema is wired
  const returns = [
    { id: '1', returnNo: 'RTN-2026-0291', customer: 'The Cannon Group', originalOrder: 'SO-2026-4801', returnDate: '2026-04-20', items: 1, amount: 54.11, reason: 'Changed Mind', status: 'Posted', creditMemo: 'CM-2026-0182' },
    { id: '2', returnNo: 'RTN-2026-0290', customer: 'Fabrikam Inc', originalOrder: 'SO-2026-4750', returnDate: '2026-04-18', items: 3, amount: 287.50, reason: 'Defective', status: 'Open', creditMemo: null },
    { id: '3', returnNo: 'RTN-2026-0289', customer: 'Adatum Corp', originalOrder: 'SO-2026-4720', returnDate: '2026-04-16', items: 1, amount: 145.00, reason: 'Wrong Item', status: 'Posted', creditMemo: 'CM-2026-0180' },
    { id: '4', returnNo: 'RTN-2026-0288', customer: 'Contoso Ltd', originalOrder: 'POS-TXN-2026', returnDate: '2026-04-15', items: 2, amount: 89.99, reason: 'Damaged', status: 'Posted', creditMemo: 'Store Credit' },
  ]

  const filtered = returns.filter(r => {
    const matchStatus = status === 'All' || r.status === status
    const matchCustomer = !customer || r.customer.toLowerCase().includes(customer.toLowerCase())
    const matchReason = !reason || r.reason === reason
    const matchSearch = !search || r.returnNo.toLowerCase().includes(search.toLowerCase()) || r.customer.toLowerCase().includes(search.toLowerCase())
    return matchStatus && matchCustomer && matchReason && matchSearch
  })

  return NextResponse.json({ data: filtered, total: filtered.length })
}

export async function POST(request: NextRequest) {
  const body = await request.json()

  // Validate required fields
  if (!body.customerId || !body.originalOrderNo) {
    return NextResponse.json({ error: 'customerId and originalOrderNo are required' }, { status: 400 })
  }

  // Mock created return — replace with prisma.salesReturn.create(...)
  const created = {
    id: crypto.randomUUID(),
    returnNo: `RTN-2026-${String(Math.floor(Math.random() * 9000) + 1000)}`,
    customerId: body.customerId,
    originalOrderNo: body.originalOrderNo,
    reason: body.reason || 'Other',
    refundMethod: body.refundMethod || 'credit-memo',
    status: 'Draft',
    lines: body.lines || [],
    createdAt: new Date().toISOString(),
  }

  return NextResponse.json({ data: created }, { status: 201 })
}
