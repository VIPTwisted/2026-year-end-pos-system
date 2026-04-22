import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const status   = searchParams.get('status')
  const customer = searchParams.get('customer')
  const search   = searchParams.get('search')
  // Accept both 'from'/'to' (legacy) and 'dateFrom'/'dateTo' (D365 spec)
  const from = searchParams.get('dateFrom') ?? searchParams.get('from')
  const to   = searchParams.get('dateTo')   ?? searchParams.get('to')

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = {}
  if (status && status !== 'all' && status !== 'All') where.status = status
  if (customer) {
    where.OR = [
      { sellToCustomerName: { contains: customer } },
      { accountName: { contains: customer } },
    ]
  }
  if (search) {
    const sq = {
      OR: [
        { orderNumber: { contains: search } },
        { sellToCustomerName: { contains: search } },
        { accountName: { contains: search } },
      ],
    }
    if (where.OR) {
      where.AND = [{ OR: where.OR }, sq]
      delete where.OR
    } else {
      Object.assign(where, sq)
    }
  }
  if (from || to) {
    where.orderDate = {}
    if (from) where.orderDate.gte = new Date(from)
    if (to)   where.orderDate.lte = new Date(to)
  }

  try {
    const orders = await prisma.salesOrder.findMany({
      where,
      include: { items: true },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(orders)
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { items, ...rest } = body

    const order = await prisma.salesOrder.create({
      data: {
        ...rest,
        orderDate: rest.orderDate ? new Date(rest.orderDate) : new Date(),
        postingDate: rest.postingDate ? new Date(rest.postingDate) : new Date(),
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

    return NextResponse.json(order, { status: 201 })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
