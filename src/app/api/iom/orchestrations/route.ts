import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const state = searchParams.get('state')
  const sourceType = searchParams.get('sourceType')
  const priority = searchParams.get('priority')

  const where: Record<string, unknown> = {}
  if (state) where.state = state
  if (sourceType) where.sourceType = sourceType
  if (priority) where.priority = priority

  const orchestrations = await prisma.orderOrchestration.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: {
      customer: { select: { id: true, firstName: true, lastName: true, email: true } },
      _count: { select: { lines: true, errors: true } },
      stateHistory: { orderBy: { createdAt: 'desc' }, take: 1 },
    },
  })
  return NextResponse.json(orchestrations)
}

export async function POST(req: NextRequest) {
  const body = await req.json()

  const year = new Date().getFullYear()
  const count = await prisma.orderOrchestration.count()
  const orchestrationNo = `IOM-${year}-${String(count + 1).padStart(4, '0')}`

  const orchestration = await prisma.orderOrchestration.create({
    data: {
      orchestrationNo,
      sourceType: body.sourceType,
      sourceId: body.sourceId || null,
      customerId: body.customerId || null,
      state: 'received',
      priority: body.priority ?? 'standard',
      isSubscription: body.isSubscription ?? false,
      orderValue: body.orderValue ?? 0,
      shippingAddress: body.shippingAddress || null,
      requestedDate: body.requestedDate ? new Date(body.requestedDate) : null,
      promisedDate: body.promisedDate ? new Date(body.promisedDate) : null,
      notes: body.notes || null,
      stateHistory: {
        create: {
          fromState: null,
          toState: 'received',
          reason: 'Order created',
          triggeredBy: 'system',
        },
      },
      lines: body.lines
        ? {
            create: body.lines.map((l: { productId: string; quantity: number; unitPrice: number; fulfillmentType?: string }) => ({
              productId: l.productId,
              quantity: l.quantity,
              unitPrice: l.unitPrice,
              lineTotal: l.quantity * l.unitPrice,
              fulfillmentType: l.fulfillmentType ?? 'ship',
              state: 'pending',
            })),
          }
        : undefined,
    },
    include: { lines: true, stateHistory: true },
  })
  return NextResponse.json(orchestration, { status: 201 })
}
