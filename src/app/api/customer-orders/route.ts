import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

function genOrderNumber() {
  return `CO-${Date.now().toString(36).toUpperCase()}`
}

export async function GET(req: NextRequest) {
  const status = req.nextUrl.searchParams.get('status') ?? ''
  const type = req.nextUrl.searchParams.get('type') ?? ''
  const search = req.nextUrl.searchParams.get('search') ?? ''

  const orders = await prisma.customerOrder.findMany({
    where: {
      ...(status ? { status } : {}),
      ...(type ? { orderType: type } : {}),
      ...(search
        ? {
            OR: [
              { orderNumber: { contains: search } },
              { customerId: { contains: search } },
            ],
          }
        : {}),
    },
    include: { lines: true, fulfillments: true },
    orderBy: { createdAt: 'desc' },
    take: 200,
  })
  return NextResponse.json(orders)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { lines, ...orderData } = body

  const order = await prisma.customerOrder.create({
    data: {
      ...orderData,
      orderNumber: genOrderNumber(),
      lines: lines?.length
        ? { create: lines }
        : undefined,
    },
    include: { lines: true },
  })
  return NextResponse.json(order, { status: 201 })
}
