import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const eventType = searchParams.get('eventType')
    const riskLevel = searchParams.get('riskLevel')
    const storeId = searchParams.get('storeId')
    const from = searchParams.get('from')
    const to = searchParams.get('to')
    const events = await prisma.auditEvent.findMany({
      where: {
        ...(eventType && eventType !== 'all' ? { eventType } : {}),
        ...(riskLevel && riskLevel !== 'all' ? { riskLevel } : {}),
        ...(storeId ? { storeId } : {}),
        ...(from || to ? { createdAt: { ...(from ? { gte: new Date(from) } : {}), ...(to ? { lte: new Date(to) } : {}) } } : {}),
      },
      orderBy: { createdAt: 'desc' },
      take: 500,
    })
    return NextResponse.json(events)
  } catch (error) {
    console.error('[GET /api/fiscal/audit]', error)
    return NextResponse.json({ error: 'Failed to fetch audit events' }, { status: 500 })
  }
}

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
        beforeValue: beforeValue ? (typeof beforeValue === 'string' ? beforeValue : JSON.stringify(beforeValue)) : null,
        afterValue: afterValue ? (typeof afterValue === 'string' ? afterValue : JSON.stringify(afterValue)) : null,
        ipAddress: ipAddress ?? null,
        sessionId: sessionId ?? null,
        riskLevel: riskLevel ?? 'low',
      },
    })
    return NextResponse.json(event, { status: 201 })
  } catch (error) {
    console.error('[POST /api/fiscal/audit]', error)
    return NextResponse.json({ error: 'Failed to create audit event' }, { status: 500 })
  }
}
