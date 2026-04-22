import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

function generateWebOrderNumber(): string {
  const year = new Date().getFullYear()
  const seq = Date.now().toString().slice(-4)
  return `WEB-${year}-${seq}`
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status')
  const channelId = searchParams.get('channelId')

  const orders = await prisma.onlineOrder.findMany({
    where: {
      ...(status ? { status } : {}),
      ...(channelId ? { channelId } : {}),
    },
    orderBy: { createdAt: 'desc' },
    include: {
      channel: { select: { id: true, name: true } },
      customer: { select: { id: true, firstName: true, lastName: true } },
      _count: { select: { lines: true } },
    },
  })
  return NextResponse.json(orders)
}

export async function POST(req: NextRequest) {
  const body = await req.json()

  const order = await prisma.onlineOrder.create({
    data: {
      orderNumber: generateWebOrderNumber(),
      channelId: body.channelId,
      customerId: body.customerId || undefined,
      guestEmail: body.guestEmail || undefined,
      guestName: body.guestName || undefined,
      status: body.status || 'pending',
      fulfillmentType: body.fulfillmentType || 'ship',
      shippingAddress: body.shippingAddress || undefined,
      billingAddress: body.billingAddress || undefined,
      shippingMethodId: body.shippingMethodId || undefined,
      subtotal: body.subtotal || 0,
      shippingCost: body.shippingCost || 0,
      taxAmount: body.taxAmount || 0,
      discountAmount: body.discountAmount || 0,
      total: body.total || 0,
      notes: body.notes || undefined,
    },
  })
  return NextResponse.json(order, { status: 201 })
}
