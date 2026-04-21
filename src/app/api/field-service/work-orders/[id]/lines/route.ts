import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

interface Params { params: Promise<{ id: string }> }

export async function GET(_req: Request, { params }: Params) {
  const { id } = await params
  try {
    const lines = await prisma.workOrderLine.findMany({
      where:   { workOrderId: id },
      orderBy: { createdAt: 'asc' },
    })
    return NextResponse.json(lines)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch lines'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function POST(req: Request, { params }: Params) {
  const { id } = await params
  try {
    const body = await req.json()
    const {
      lineType    = 'labor',
      description,
      quantity    = 1,
      unitCost    = 0,
    } = body as {
      lineType?:    string
      description?: string
      quantity?:    number
      unitCost?:    number
    }

    if (!description?.trim()) {
      return NextResponse.json({ error: 'Description is required' }, { status: 400 })
    }

    // Verify WO exists
    const wo = await prisma.workOrder.findUnique({ where: { id } })
    if (!wo) return NextResponse.json({ error: 'Work order not found' }, { status: 404 })

    const totalCost = quantity * unitCost

    const line = await prisma.workOrderLine.create({
      data: {
        workOrderId: id,
        lineType,
        description: description.trim(),
        quantity,
        unitCost,
        totalCost,
      },
    })

    return NextResponse.json(line, { status: 201 })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to create line'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
