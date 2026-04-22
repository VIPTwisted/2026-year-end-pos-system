import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string; rid: string }> }) {
  const { rid } = await params
  const body = await req.json()
  const updated = await prisma.marketingRegistration.update({ where: { id: rid }, data: { status: body.status } })
  if (body.status === 'attended') {
    await prisma.marketingEvent.update({ where: { id: updated.eventId }, data: { attended: { increment: 1 } } })
  }
  return NextResponse.json(updated)
}
