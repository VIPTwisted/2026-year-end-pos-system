import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { holdType, reason, placedBy, notes } = await req.json()
  if (!holdType || !reason) return NextResponse.json({ error: 'holdType and reason are required' }, { status: 400 })
  const hold = await prisma.callCenterHold.create({
    data: { orderId: id, holdType, reason, placedBy, notes, status: 'active' },
  })
  const newStatus = holdType === 'fraud' ? 'fraud-hold' : 'on-hold'
  await prisma.callCenterOrder.update({ where: { id }, data: { status: newStatus } })
  return NextResponse.json(hold, { status: 201 })
}
