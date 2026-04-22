import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const agentId = searchParams.get('agentId')
    const customerId = searchParams.get('customerId')

    const calls = await prisma.callLog.findMany({
      where: {
        ...(agentId ? { agentId } : {}),
        ...(customerId ? { customerId } : {}),
      },
      orderBy: { callStartedAt: 'desc' },
      take: 200,
      include: {
        agent: { select: { id: true, name: true, extension: true } },
        customer: { select: { id: true, firstName: true, lastName: true } },
      },
    })
    return NextResponse.json(calls)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      agentId: string
      customerId?: string
      direction?: string
      duration?: number | string
      outcome?: string
      notes?: string
      orderId?: string
      callStartedAt?: string
      callEndedAt?: string
    }

    if (!body.agentId) {
      return NextResponse.json({ error: 'agentId is required' }, { status: 400 })
    }

    const call = await prisma.callLog.create({
      data: {
        agentId: body.agentId,
        customerId: body.customerId || undefined,
        direction: body.direction || 'inbound',
        duration: body.duration ? parseInt(String(body.duration)) : undefined,
        outcome: body.outcome || undefined,
        notes: body.notes || undefined,
        orderId: body.orderId || undefined,
        callStartedAt: body.callStartedAt ? new Date(body.callStartedAt) : new Date(),
        callEndedAt: body.callEndedAt ? new Date(body.callEndedAt) : undefined,
      },
    })
    return NextResponse.json(call, { status: 201 })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
