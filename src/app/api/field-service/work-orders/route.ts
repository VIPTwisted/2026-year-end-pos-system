import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateWONumber } from '@/lib/utils'

export async function GET() {
  try {
    const workOrders = await prisma.workOrder.findMany({
      include: {
        store:    true,
        customer: true,
        lines:    true,
      },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(workOrders)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch work orders'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const {
      title,
      description,
      priority    = 'medium',
      storeId,
      customerId,
      assignedTo,
      scheduledAt,
      estimatedHrs,
    } = body as {
      title:        string
      description?: string
      priority?:    string
      storeId?:     string
      customerId?:  string
      assignedTo?:  string
      scheduledAt?: string
      estimatedHrs?: number
    }

    if (!title?.trim()) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 })
    }

    const woNumber = generateWONumber()

    const workOrder = await prisma.workOrder.create({
      data: {
        woNumber,
        title:        title.trim(),
        description:  description?.trim() || null,
        status:       'new',
        priority,
        storeId:      storeId     || '',
        customerId:   customerId  || null,
        assignedTo:   assignedTo  || null,
        scheduledAt:  scheduledAt ? new Date(scheduledAt) : null,
        estimatedHrs: estimatedHrs ?? null,
      },
      include: { store: true, customer: true, lines: true },
    })

    return NextResponse.json(workOrder, { status: 201 })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to create work order'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
