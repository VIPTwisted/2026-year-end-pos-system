import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const state = searchParams.get('state')

  const returns = await prisma.returnOrchestration.findMany({
    where: state ? { state } : {},
    orderBy: { createdAt: 'desc' },
    include: {
      customer: { select: { id: true, firstName: true, lastName: true } },
      _count: { select: { lines: true } },
    },
  })
  return NextResponse.json(returns)
}

export async function POST(req: NextRequest) {
  const body = await req.json()

  const year = new Date().getFullYear()
  const count = await prisma.returnOrchestration.count()
  const returnNo = `RET-IOM-${year}-${String(count + 1).padStart(4, '0')}`

  const ret = await prisma.returnOrchestration.create({
    data: {
      returnNo,
      orchestrationId: body.orchestrationId || null,
      customerId: body.customerId || null,
      state: 'initiated',
      reason: body.reason || null,
      refundMethod: body.refundMethod ?? 'original',
      returnProviderId: body.returnProviderId || null,
      stateHistory: {
        create: {
          fromState: null,
          toState: 'initiated',
          reason: 'Return initiated',
        },
      },
      lines: body.lines
        ? {
            create: body.lines.map((l: { productId: string; quantity: number; condition?: string; disposition?: string }) => ({
              productId: l.productId,
              quantity: l.quantity,
              condition: l.condition ?? 'good',
              disposition: l.disposition ?? 'restock',
            })),
          }
        : undefined,
    },
    include: { lines: true },
  })
  return NextResponse.json(ret, { status: 201 })
}
