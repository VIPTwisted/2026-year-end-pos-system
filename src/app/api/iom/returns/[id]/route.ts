import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const RETURN_TRANSITIONS: Record<string, string[]> = {
  initiated: ['label_created', 'closed'],
  label_created: ['in_transit'],
  in_transit: ['received'],
  received: ['inspected'],
  inspected: ['refund_issued'],
  refund_issued: ['closed'],
  closed: [],
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const ret = await prisma.returnOrchestration.findUnique({
    where: { id },
    include: {
      customer: true,
      returnProvider: true,
      lines: { include: { product: { select: { id: true, name: true, sku: true } } } },
      stateHistory: { orderBy: { createdAt: 'desc' } },
    },
  })
  if (!ret) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(ret)
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()

  const ret = await prisma.returnOrchestration.findUnique({ where: { id } })
  if (!ret) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const data: Record<string, unknown> = {}

  if (body.toState) {
    const allowed = RETURN_TRANSITIONS[ret.state] ?? []
    if (!allowed.includes(body.toState)) {
      return NextResponse.json({ error: `Invalid transition: ${ret.state} → ${body.toState}` }, { status: 400 })
    }
    data.state = body.toState
  }

  if (body.trackingNumber) data.trackingNumber = body.trackingNumber
  if (body.labelUrl) data.labelUrl = body.labelUrl
  if (body.returnProviderId) data.returnProviderId = body.returnProviderId

  const updated = await prisma.returnOrchestration.update({ where: { id }, data })

  if (body.toState) {
    await prisma.returnStateHistory.create({
      data: {
        returnId: id,
        fromState: ret.state,
        toState: body.toState,
        reason: body.reason || null,
      },
    })
  }

  return NextResponse.json(updated)
}
