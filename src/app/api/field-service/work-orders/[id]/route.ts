import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

interface Params { params: Promise<{ id: string }> }

export async function GET(_req: Request, { params }: Params) {
  const { id } = await params
  try {
    const workOrder = await prisma.workOrder.findUnique({
      where: { id },
      include: {
        store:    true,
        customer: true,
        lines:    { orderBy: { createdAt: 'asc' } },
      },
    })
    if (!workOrder) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(workOrder)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch work order'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function PATCH(req: Request, { params }: Params) {
  const { id } = await params
  try {
    const body = await req.json()
    const {
      status,
      assignedTo,
      scheduledAt,
      actualHrs,
      notes,
    } = body as {
      status?:      string
      assignedTo?:  string
      scheduledAt?: string
      actualHrs?:   number
      notes?:       string
    }

    const data: Record<string, unknown> = {}
    if (status      !== undefined) data.status      = status
    if (assignedTo  !== undefined) data.assignedTo  = assignedTo
    if (scheduledAt !== undefined) data.scheduledAt = scheduledAt ? new Date(scheduledAt) : null
    if (actualHrs   !== undefined) data.actualHrs   = actualHrs
    if (notes       !== undefined) data.notes       = notes

    // Auto-set completedAt when marking completed
    if (status === 'completed') data.completedAt = new Date()
    if (status && status !== 'completed') data.completedAt = null

    const workOrder = await prisma.workOrder.update({
      where: { id },
      data,
      include: {
        store:    true,
        customer: true,
        lines:    { orderBy: { createdAt: 'asc' } },
      },
    })

    return NextResponse.json(workOrder)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to update work order'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
