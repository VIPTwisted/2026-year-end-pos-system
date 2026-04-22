import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status')

  const rfqs = await prisma.purchaseRFQ.findMany({
    where: { ...(status ? { status } : {}) },
    include: {
      vendor: { select: { id: true, name: true } },
      lines: { include: { product: { select: { id: true, name: true, sku: true } } } },
      quotes: { include: { vendor: { select: { id: true, name: true } } } },
    },
    orderBy: { createdAt: 'desc' },
    take: 200,
  })

  return NextResponse.json(rfqs)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { vendorId, responseDeadline, notes, lines } = body

  if (!lines || !Array.isArray(lines) || lines.length === 0) {
    return NextResponse.json({ error: 'At least one line is required' }, { status: 400 })
  }

  const year = new Date().getFullYear()
  const last = await prisma.purchaseRFQ.findFirst({
    where: { rfqNumber: { startsWith: `RFQ-${year}-` } },
    orderBy: { createdAt: 'desc' },
  })
  let seq = 1
  if (last) {
    const parts = last.rfqNumber.split('-')
    const n = parseInt(parts[2] ?? '0', 10)
    if (!isNaN(n)) seq = n + 1
  }
  const rfqNumber = `RFQ-${year}-${String(seq).padStart(4, '0')}`

  const rfq = await prisma.purchaseRFQ.create({
    data: {
      rfqNumber,
      vendorId: vendorId || null,
      status: 'open',
      responseDeadline: responseDeadline ? new Date(responseDeadline) : null,
      notes: notes || null,
      lines: {
        create: lines.map((l: { productId: string; quantity: number; unitOfMeasure?: string; neededByDate?: string; description?: string }) => ({
          productId: l.productId,
          quantity: Number(l.quantity),
          unitOfMeasure: l.unitOfMeasure || 'EACH',
          neededByDate: l.neededByDate ? new Date(l.neededByDate) : null,
          description: l.description || null,
        })),
      },
    },
    include: {
      vendor: true,
      lines: { include: { product: true } },
      quotes: true,
    },
  })

  return NextResponse.json(rfq, { status: 201 })
}
