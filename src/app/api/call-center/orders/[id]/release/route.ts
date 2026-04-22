import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { releasedBy, notes } = await req.json()
  await prisma.callCenterHold.updateMany({
    where: { orderId: id, status: 'active' },
    data: { status: 'released', releasedBy: releasedBy ?? 'system', releasedAt: new Date(), notes },
  })
  const updated = await prisma.callCenterOrder.update({ where: { id }, data: { status: 'submitted' } })
  return NextResponse.json(updated)
}
