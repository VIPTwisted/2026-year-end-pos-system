import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const status = req.nextUrl.searchParams.get('status')
  const orders = await prisma.recurringOrder.findMany({
    where: status ? { status } : undefined,
    include: {
      lines: true,
      _count: { select: { lines: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 200,
  })
  return NextResponse.json(orders)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { lines, ...orderData } = body

  const count = await prisma.recurringOrder.count()
  const orderNumber = `RO-${String(count + 1).padStart(6, '0')}`

  const order = await prisma.recurringOrder.create({
    data: {
      ...orderData,
      orderNumber,
      lines: lines ? { create: lines } : undefined,
    },
    include: { lines: true },
  })
  return NextResponse.json(order, { status: 201 })
}
