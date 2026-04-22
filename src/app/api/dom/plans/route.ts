import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status')

  const plans = await prisma.fulfillmentPlan.findMany({
    where: { ...(status ? { status } : {}) },
    orderBy: { createdAt: 'desc' },
    include: {
      _count: { select: { lines: true } },
    },
  })
  return NextResponse.json(plans)
}

export async function POST(req: NextRequest) {
  const body = await req.json()

  const plan = await prisma.fulfillmentPlan.create({
    data: {
      onlineOrderId: body.onlineOrderId || undefined,
      orderId: body.orderId || undefined,
      status: 'pending',
      lines: body.lines
        ? {
            create: body.lines.map((l: {
              productId: string
              quantity: number
              fulfillFromStoreId?: string
              fulfillmentType: string
            }) => ({
              productId: l.productId,
              quantity: l.quantity,
              fulfillFromStoreId: l.fulfillFromStoreId || undefined,
              fulfillmentType: l.fulfillmentType,
              status: 'pending',
            })),
          }
        : undefined,
    },
    include: {
      lines: { include: { product: { select: { id: true, name: true, sku: true } } } },
    },
  })
  return NextResponse.json(plan, { status: 201 })
}
