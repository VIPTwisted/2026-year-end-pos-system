import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const lines = await prisma.projectPlanningLine.findMany({
    where: { projectId: id },
    include: {
      product: { select: { id: true, name: true, sku: true } },
    },
    orderBy: { plannedDate: 'asc' },
  })
  return NextResponse.json(lines)
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    const body = await req.json()
    const { taskId, lineType, description, productId, quantity, unitPrice, unitCost, plannedDate, isBillable } = body

    if (!description?.trim()) {
      return NextResponse.json({ error: 'Description is required' }, { status: 400 })
    }

    const qty = parseFloat(quantity) || 1
    const price = parseFloat(unitPrice) || 0
    const cost = parseFloat(unitCost) || 0

    const line = await prisma.projectPlanningLine.create({
      data: {
        projectId: id,
        taskId: taskId || null,
        lineType: lineType || 'resource',
        description: description.trim(),
        productId: productId || null,
        quantity: qty,
        unitPrice: price,
        unitCost: cost,
        lineAmount: qty * price,
        plannedDate: plannedDate ? new Date(plannedDate) : null,
      },
      include: {
        product: { select: { id: true, name: true, sku: true } },
      },
    })
    return NextResponse.json(line, { status: 201 })
  } catch (err: unknown) {
    console.error(err)
    return NextResponse.json({ error: 'Create failed' }, { status: 500 })
  }
}
