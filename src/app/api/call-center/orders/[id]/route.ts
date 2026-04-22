import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const order = await prisma.callCenterOrder.findUnique({
    where: { id },
    include: {
      lines: true,
      holds: { orderBy: { createdAt: 'desc' } },
      rmas: { orderBy: { createdAt: 'desc' } },
      continuityEnrollments: true,
    },
  })
  if (!order) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(order)
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const order = await prisma.callCenterOrder.update({
    where: { id },
    data: body,
    include: { lines: true, holds: true },
  })
  return NextResponse.json(order)
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await prisma.callCenterOrder.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
