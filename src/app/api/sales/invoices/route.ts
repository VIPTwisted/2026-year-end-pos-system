import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status')
  const customer = searchParams.get('customer')

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = {}
  if (status && status !== 'all') where.status = status
  if (customer) {
    where.OR = [
      { sellToCustomerName: { contains: customer } },
      { accountName: { contains: customer } },
    ]
  }

  try {
    const invoices = await prisma.salesInvoice.findMany({
      where,
      include: { items: true },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(invoices)
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { items, ...rest } = body

    const invoice = await prisma.salesInvoice.create({
      data: {
        ...rest,
        postingDate: rest.postingDate ? new Date(rest.postingDate) : new Date(),
        dueDate: rest.dueDate ? new Date(rest.dueDate) : undefined,
        items: items
          ? {
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
            }
          : undefined,
      },
      include: { items: true },
    })

    return NextResponse.json(invoice, { status: 201 })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
