import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const order = await prisma.callCenterOrder.findUnique({
    where: { id },
    include: { holds: { where: { status: 'active' } } },
  })
  if (!order) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  const activeHolds = order.holds.filter((h) => h.status === 'active')
  if (activeHolds.length > 0) {
    return NextResponse.json({ error: 'Cannot submit — active hold exists. Release all holds first.' }, { status: 422 })
  }
  const updated = await prisma.callCenterOrder.update({ where: { id }, data: { status: 'submitted' } })
  return NextResponse.json(updated)
}
