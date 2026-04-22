import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status')

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = {}
  if (status && status !== 'All') where.status = status

  try {
    const orders = await prisma.salesReturnOrder.findMany({
      where,
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
    const { lines, ...rest } = body

    const order = await prisma.salesReturnOrder.create({
      data: {
        ...rest,
        returnDate: rest.returnDate ? new Date(rest.returnDate) : new Date(),
        postingDate: rest.postingDate ? new Date(rest.postingDate) : new Date(),
        lines: lines
          ? {
              create: lines.map((l: Record<string, unknown>) => ({
                lineType: String(l.lineType ?? 'Item'),
                itemNo: String(l.itemNo ?? ''),
                description: String(l.description ?? ''),
                quantity: Number(l.quantity ?? 1),
                unitPrice: Number(l.unitPrice ?? 0),
                lineTotal: Number(l.lineTotal ?? 0),
              })),
            }
          : undefined,
      },
      include: { lines: true },
    })

    return NextResponse.json(order, { status: 201 })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
