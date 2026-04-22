import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

type Params = { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const { id } = await params
    const invoice = await prisma.salesInvoice.findUnique({
      where: { id },
      include: { items: true, order: true },
    })
    if (!invoice) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(invoice)
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params
    const body = await req.json()
    const { action, items, ...rest } = body

    if (action === 'post') {
      rest.status = 'Posted'
      rest.postingDate = new Date()
    }
    if (action === 'cancel') rest.status = 'Cancelled'
    if (action === 'release') rest.status = 'Released'

    const invoice = await prisma.salesInvoice.update({
      where: { id },
      data: {
        ...rest,
        ...(items !== undefined
          ? {
              items: {
                deleteMany: {},
                create: items.map((i: Record<string, unknown>) => ({
                  lineType: String(i.lineType ?? 'Item'),
                  itemNo: String(i.itemNo ?? ''),
                  description: String(i.description ?? ''),
                  productName: String(i.description ?? ''),
                  quantity: Number(i.quantity ?? 1),
                  unitPrice: Number(i.unitPrice ?? 0),
                  pricePerUnit: Number(i.unitPrice ?? 0),
                  discountPct: Number(i.discountPct ?? 0),
                  lineTotal: Number(i.lineTotal ?? 0),
                })),
              },
            }
          : {}),
      },
      include: { items: true },
    })
    return NextResponse.json(invoice)
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
