import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/audit/events
 * Paginated, filtered query of AuditEvent records.
 * Query params: q, riskLevel, eventType, from, to, skip, take
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)

  const q = searchParams.get('q')
  const riskLevel = searchParams.get('riskLevel')
  const eventType = searchParams.get('eventType')
  const from = searchParams.get('from')
  const to = searchParams.get('to')
  const take = Math.min(parseInt(searchParams.get('take') ?? '50'), 200)
  const skip = parseInt(searchParams.get('skip') ?? '0')

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: Record<string, any> = {}

  if (riskLevel) where.riskLevel = riskLevel
  if (eventType) where.eventType = eventType

  if (from || to) {
    where.createdAt = {
      ...(from ? { gte: new Date(from) } : {}),
      ...(to ? { lte: new Date(new Date(to).setHours(23, 59, 59, 999)) } : {}),
    }
  }

  if (q) {
    where.OR = [
      { description: { contains: q } },
      { userName: { contains: q } },
      { eventType: { contains: q } },
      { storeName: { contains: q } },
      { userId: { contains: q } },
    ]
  }

  const [events, total] = await Promise.all([
    prisma.auditEvent.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take,
      skip,
    }),
    prisma.auditEvent.count({ where }),
  ])

  return NextResponse.json({ events, total, skip, take })
}

/**
 * POST /api/audit/events
 * Create a new audit event (write from application code).
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { eventType, userId, userName, storeId, storeName, registerId, description, beforeValue, afterValue, ipAddress, sessionId, riskLevel } = body

    if (!eventType || !description) {
      return NextResponse.json({ error: 'eventType and description are required' }, { status: 400 })
    }

    const event = await prisma.auditEvent.create({
      data: {
        eventType,
        userId: userId ?? null,
        userName: userName ?? null,
        storeId: storeId ?? null,
        storeName: storeName ?? null,
        registerId: registerId ?? null,
        description,
        beforeValue: beforeValue ?? null,
        afterValue: afterValue ?? null,
        ipAddress: ipAddress ?? null,
        sessionId: sessionId ?? null,
        riskLevel: riskLevel ?? 'low',
      },
    })

    return NextResponse.json(event, { status: 201 })
  } catch (err) {
    console.error('[audit/events POST]', err)
    return NextResponse.json({ error: 'Failed to create audit event' }, { status: 500 })
  }
}
