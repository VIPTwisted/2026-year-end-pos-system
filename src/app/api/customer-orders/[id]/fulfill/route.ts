import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

function genFulfillmentNo() {
  return `FUL-${Date.now().toString(36).toUpperCase()}`
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await req.json()
  const { lines, ...fulfillmentData } = body

  const fulfillment = await prisma.orderFulfillment.create({
    data: {
      ...fulfillmentData,
      orderId: id,
      fulfillmentNo: genFulfillmentNo(),
      lines: lines?.length ? { create: lines } : undefined,
    },
    include: { lines: true },
  })

  await prisma.customerOrder.update({
    where: { id },
    data: { status: 'picking' },
  })

  return NextResponse.json(fulfillment, { status: 201 })
}
