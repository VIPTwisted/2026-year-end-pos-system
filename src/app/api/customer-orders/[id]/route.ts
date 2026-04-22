import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const order = await prisma.customerOrder.findUnique({
    where: { id },
    include: {
      lines: true,
      fulfillments: { include: { lines: true } },
    },
  })
  if (!order) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(order)
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await req.json()
  const order = await prisma.customerOrder.update({
    where: { id },
    data: body,
    include: { lines: true, fulfillments: true },
  })
  return NextResponse.json(order)
}
