import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string; sid: string }> }) {
  const { sid } = await params
  const body = await req.json()
  const shift = await prisma.scheduledShift.update({
    where: { id: sid },
    data: body,
  })
  return NextResponse.json(shift)
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string; sid: string }> }) {
  const { sid } = await params
  await prisma.scheduledShift.delete({ where: { id: sid } })
  return NextResponse.json({ ok: true })
}
