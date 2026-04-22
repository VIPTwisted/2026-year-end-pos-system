import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const status   = searchParams.get('status') ?? ''
  const vendorId = searchParams.get('vendorId') ?? ''

  const pos = await prisma.vpVendorPO.findMany({
    where: {
      AND: [
        status   ? { status }   : {},
        vendorId ? { vendorId } : {},
      ],
    },
    include: {
      vendor: { select: { id: true, name: true, vendorNumber: true } },
      _count: { select: { lines: true } },
    },
    orderBy: { orderDate: 'desc' },
  })

  return NextResponse.json(pos)
}

export async function POST(req: NextRequest) {
  const body = await req.json()

  if (!body.vendorId) {
    return NextResponse.json({ error: 'vendorId is required' }, { status: 400 })
  }

  const count = await prisma.vpVendorPO.count()
  const poNumber = `PO-${String(count + 1).padStart(6, '0')}`

  const lines: { productName: string; sku?: string; qty: number; unitCost: number }[] = body.lines ?? []
  const totalAmount = lines.reduce((s: number, l: { qty: number; unitCost: number }) => s + l.qty * l.unitCost, 0)

  const po = await prisma.vpVendorPO.create({
    data: {
      vendorId:     body.vendorId,
      poNumber,
      status:       'draft',
      expectedDate: body.expectedDate ? new Date(body.expectedDate) : null,
      totalAmount,
      currency:     body.currency ?? 'USD',
      notes:        body.notes ?? null,
      lines: {
        create: lines.map((l) => ({
          productName: l.productName,
          sku:         l.sku ?? null,
          qty:         l.qty,
          unitCost:    l.unitCost,
          lineTotal:   l.qty * l.unitCost,
        })),
      },
    },
    include: { lines: true, vendor: true },
  })

  return NextResponse.json(po, { status: 201 })
}
