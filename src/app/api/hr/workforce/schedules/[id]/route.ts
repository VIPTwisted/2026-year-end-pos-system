import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const schedule = await prisma.schedule.findUnique({
    where: { id },
    include: { shifts: { orderBy: { startTime: 'asc' } } },
  })
  if (!schedule) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(schedule)
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const schedule = await prisma.schedule.update({ where: { id }, data: body })
  return NextResponse.json(schedule)
}
