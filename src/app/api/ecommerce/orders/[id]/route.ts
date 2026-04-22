import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const order = await prisma.onlineOrder.findUnique({
    where: { id },
    include: {
      channel: true,
      customer: { select: { id: true, firstName: true, lastName: true, email: true } },
      lines: {
        include: { product: { select: { id: true, name: true, sku: true } } },
      },
    },
  })
  if (!order) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(order)
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const allowed = ['status', 'trackingNumber', 'fulfillmentType', 'notes', 'shippingMethodId']
  const data = Object.fromEntries(Object.entries(body).filter(([k]) => allowed.includes(k)))
  const order = await prisma.onlineOrder.update({ where: { id }, data })
  return NextResponse.json(order)
}
