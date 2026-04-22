import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const orch = await prisma.orderOrchestration.findUnique({
    where: { id },
    include: {
      customer: true,
      lines: {
        include: {
          product: { select: { id: true, name: true, sku: true } },
          allocatedProvider: { select: { id: true, name: true, type: true } },
        },
      },
      stateHistory: { orderBy: { createdAt: 'desc' } },
      allocations: {
        include: { provider: { select: { id: true, name: true, type: true } } },
        orderBy: { allocationScore: 'desc' },
      },
      errors: { orderBy: { createdAt: 'desc' } },
    },
  })
  if (!orch) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(orch)
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const orch = await prisma.orderOrchestration.update({
    where: { id },
    data: {
      state: body.state,
      priority: body.priority,
      notes: body.notes,
      promisedDate: body.promisedDate ? new Date(body.promisedDate) : undefined,
    },
  })
  return NextResponse.json(orch)
}
