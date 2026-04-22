import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const schedule = await prisma.schedule.findUnique({
    where: { id: params.id },
    include: {
      shifts: { orderBy: { startTime: 'asc' } },
      _count: { select: { shifts: true } },
    },
  })
  if (!schedule) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(schedule)
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const body = await req.json()
  const schedule = await prisma.schedule.update({
    where: { id: params.id },
    data: {
      ...(body.name ? { name: body.name } : {}),
      ...(body.status ? { status: body.status } : {}),
      ...(body.weekStart ? { weekStart: new Date(body.weekStart) } : {}),
      ...(body.weekEnd ? { weekEnd: new Date(body.weekEnd) } : {}),
    },
    include: {
      shifts: { orderBy: { startTime: 'asc' } },
      _count: { select: { shifts: true } },
    },
  })
  return NextResponse.json(schedule)
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  await prisma.schedule.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
}
