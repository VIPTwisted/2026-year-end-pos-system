import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')
    const entityType = searchParams.get('entityType')

    const where: Record<string, unknown> = {}
    if (status) where.status = status
    if (entityType) where.entityType = entityType

    const requests = await prisma.approvalRequest.findMany({
      where,
      include: {
        workflow: { select: { id: true, name: true, entityType: true } },
        actions: { orderBy: { createdAt: 'asc' } },
      },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(requests)
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to fetch approval requests' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { workflowId, entityType, entityId, entityRef, requestedBy, notes } = body

    if (!workflowId || !entityType || !entityId || !entityRef || !requestedBy) {
      return NextResponse.json({ error: 'workflowId, entityType, entityId, entityRef, requestedBy are required' }, { status: 400 })
    }

    const request = await prisma.approvalRequest.create({
      data: {
        workflowId,
        entityType,
        entityId,
        entityRef,
        requestedBy,
        notes: notes ?? null,
        currentStep: 1,
        status: 'pending',
      },
      include: { workflow: true, actions: true },
    })
    return NextResponse.json(request, { status: 201 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to create approval request' }, { status: 500 })
  }
}
