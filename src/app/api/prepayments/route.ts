import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const type = searchParams.get('type')
  const status = searchParams.get('status')

  const prepayments = await prisma.payment.findMany({
    where: {
      ...(type ? { type } : {}),
      ...(status ? { status } : {}),
    },
    include: {
      customer: { select: { id: true, firstName: true, lastName: true } },
      vendor: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 200,
  })

  return NextResponse.json(prepayments)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { type, customerId, vendorId, orderId, purchaseOrderId, amount, pctOfOrder, dueDate, notes } = body

  if (!type || !['customer', 'vendor'].includes(type)) {
    return NextResponse.json({ error: 'type must be customer or vendor' }, { status: 400 })
  }
  if (!amount || Number(amount) <= 0) {
    return NextResponse.json({ error: 'amount must be positive' }, { status: 400 })
  }
  if (type === 'customer' && !customerId) {
    return NextResponse.json({ error: 'customerId required for customer prepayment' }, { status: 400 })
  }
  if (type === 'vendor' && !vendorId) {
    return NextResponse.json({ error: 'vendorId required for vendor prepayment' }, { status: 400 })
  }

  const year = new Date().getFullYear()
  const last = await prisma.payment.findFirst({
    where: { prepaymentNo: { startsWith: `PREP-${year}-` } },
    orderBy: { createdAt: 'desc' },
  })
  let seq = 1
  if (last?.prepaymentNo) {
    const parts = last.prepaymentNo.split('-')
    const n = parseInt(parts[2] ?? '0', 10)
    if (!isNaN(n)) seq = n + 1
  }
  const prepaymentNo = `PREP-${year}-${String(seq).padStart(4, '0')}`

  const prepayment = await prisma.payment.create({
    data: {
      prepaymentNo,
      type,
      customerId: type === 'customer' ? customerId : null,
      vendorId: type === 'vendor' ? vendorId : null,
      orderId: orderId || null,
      purchaseOrderId: purchaseOrderId || null,
      amount: Number(amount),
      pctOfOrder: pctOfOrder ? Number(pctOfOrder) : null,
      status: 'open',
      dueDate: dueDate ? new Date(dueDate) : null,
      notes: notes || null,
    },
    include: {
      customer: { select: { id: true, firstName: true, lastName: true } },
      vendor: { select: { id: true, name: true } },
    },
  })

  return NextResponse.json(prepayment, { status: 201 })
}
