import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const lines = await prisma.projectBudgetLine.findMany({
    where: { projectId: id },
    orderBy: [{ lineType: 'asc' }, { createdAt: 'asc' }],
  })
  return NextResponse.json(lines)
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    const body = await req.json()
    const { description, lineType, quantity, unitAmount, period, taskId } = body as {
      description: string
      lineType?: string
      quantity?: number
      unitAmount?: number
      period?: string
      taskId?: string
    }

    if (!description?.trim()) {
      return NextResponse.json({ error: 'description is required' }, { status: 400 })
    }

    const qty  = Number(quantity  ?? 0)
    const unit = Number(unitAmount ?? 0)

    const line = await prisma.projectBudgetLine.create({
      data: {
        projectId:    id,
        description:  description.trim(),
        lineType:     lineType ?? 'time',
        quantity:     qty,
        unitAmount:   unit,
        budgetAmount: qty * unit,
        period:       period ?? undefined,
        taskId:       taskId ?? undefined,
      },
    })
    return NextResponse.json(line, { status: 201 })
  } catch (err: unknown) {
    console.error(err)
    return NextResponse.json({ error: 'Create failed' }, { status: 500 })
  }
}
