import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const employeeId = searchParams.get('employeeId')
  const status = searchParams.get('status')
  const where: Record<string, unknown> = {}
  if (employeeId) where.employeeId = employeeId
  if (status) where.status = status
  const events = await prisma.lifeEvent.findMany({
    where,
    orderBy: { eventDate: 'desc' },
  })
  return NextResponse.json(events)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const event = await prisma.lifeEvent.create({
    data: {
      employeeId: body.employeeId,
      eventType: body.eventType,
      eventDate: new Date(body.eventDate),
      description: body.description ?? null,
      status: 'pending',
      notes: body.notes ?? null,
    },
  })
  return NextResponse.json(event, { status: 201 })
}
