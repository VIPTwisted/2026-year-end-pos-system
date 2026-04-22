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
  if (!body.employeeId || !body.eventType || !body.eventDate) {
    return NextResponse.json({ error: 'employeeId, eventType, and eventDate are required' }, { status: 400 })
  }
  const event = await prisma.lifeEvent.create({
    data: {
      employeeId: body.employeeId,
      eventType: body.eventType,
      eventDate: new Date(body.eventDate),
      documentation: body.documentation ?? null,
      changesJson: body.changesJson ?? null,
      status: 'pending',
    },
  })
  return NextResponse.json(event, { status: 201 })
}
