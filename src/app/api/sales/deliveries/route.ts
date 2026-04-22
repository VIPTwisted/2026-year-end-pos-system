export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status') || 'All'
  const carrier = searchParams.get('carrier') || ''
  const search = searchParams.get('search') || ''

  // Static mock data — replace with prisma queries when schema is wired
  const deliveries = [
    { id: '1', deliveryNo: 'DEL-2026-0841', salesOrder: 'SO-2026-4901', customer: 'Fabrikam Inc', carrier: 'UPS Ground', trackingNo: '1Z999AA10123456784', shipDate: '2026-04-22', estDelivery: '2026-04-25', status: 'In Transit', items: 3 },
    { id: '2', deliveryNo: 'DEL-2026-0840', salesOrder: 'SO-2026-4899', customer: 'Contoso Ltd', carrier: 'FedEx 2Day', trackingNo: '449044304137821', shipDate: '2026-04-22', estDelivery: '2026-04-24', status: 'Shipped', items: 1 },
    { id: '3', deliveryNo: 'DEL-2026-0839', salesOrder: 'SO-2026-4897', customer: 'Adatum Corp', carrier: 'USPS Priority', trackingNo: '9400111899223397623910', shipDate: '2026-04-21', estDelivery: '2026-04-24', status: 'Exception', items: 2 },
    { id: '4', deliveryNo: 'DEL-2026-0838', salesOrder: 'SO-2026-4890', customer: 'Litware Inc', carrier: 'UPS Ground', trackingNo: '1Z999AA10123456001', shipDate: '2026-04-20', estDelivery: '2026-04-23', status: 'Delivered', items: 5 },
  ]

  const filtered = deliveries.filter(d => {
    const matchStatus = status === 'All' || d.status === status
    const matchCarrier = !carrier || d.carrier === carrier
    const matchSearch = !search || d.deliveryNo.toLowerCase().includes(search.toLowerCase()) || d.customer.toLowerCase().includes(search.toLowerCase()) || d.trackingNo.includes(search)
    return matchStatus && matchCarrier && matchSearch
  })

  return NextResponse.json({ data: filtered, total: filtered.length })
}

export async function POST(request: NextRequest) {
  const body = await request.json()

  if (!body.salesOrderNo || !body.carrier) {
    return NextResponse.json({ error: 'salesOrderNo and carrier are required' }, { status: 400 })
  }

  const created = {
    id: crypto.randomUUID(),
    deliveryNo: `DEL-2026-${String(Math.floor(Math.random() * 9000) + 1000)}`,
    salesOrderNo: body.salesOrderNo,
    carrier: body.carrier,
    trackingNo: body.trackingNo || null,
    status: 'Pending',
    shipDate: null,
    estDelivery: body.estDelivery || null,
    lines: body.lines || [],
    createdAt: new Date().toISOString(),
  }

  return NextResponse.json({ data: created }, { status: 201 })
}
