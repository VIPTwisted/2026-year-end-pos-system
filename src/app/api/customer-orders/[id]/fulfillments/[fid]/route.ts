import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; fid: string }> }
) {
  const { id, fid } = await params
  const body = await req.json()

  const now = new Date()
  const extras: Record<string, Date> = {}
  if (body.status === 'packed') extras.packedAt = now
  if (body.status === 'shipped') extras.shippedAt = now
  if (body.status === 'delivered') extras.deliveredAt = now

  const fulfillment = await prisma.orderFulfillment.update({
    where: { id: fid },
    data: { ...body, ...extras },
    include: { lines: true },
  })

  const statusMap: Record<string, string> = {
    picking: 'picking',
    packing: 'picking',
    packed: 'packed',
    shipped: 'shipped',
    delivered: 'delivered',
  }
  if (body.status && statusMap[body.status]) {
    await prisma.customerOrder.update({
      where: { id },
      data: { status: statusMap[body.status] },
    })
  }

  return NextResponse.json(fulfillment)
}
