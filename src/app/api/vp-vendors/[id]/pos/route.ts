import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const pos = await prisma.vpVendorPO.findMany({
    where: { vendorId: id },
    include: { lines: true },
    orderBy: { orderDate: 'desc' },
  })
  return NextResponse.json(pos)
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await req.json()

  const count = await prisma.vpVendorPO.count()
  const poNumber = `PO-${String(count + 1).padStart(6, '0')}`

  const lines: { productName: string; sku?: string; qty: number; unitCost: number }[] = body.lines ?? []
  const totalAmount = lines.reduce((s: number, l: { qty: number; unitCost: number }) => s + l.qty * l.unitCost, 0)

  const po = await prisma.vpVendorPO.create({
    data: {
      vendorId:     id,
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
    include: { lines: true },
  })

  return NextResponse.json(po, { status: 201 })
}
