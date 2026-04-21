import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const workflows = await prisma.approvalWorkflow.findMany({
      include: {
        steps: { orderBy: { stepOrder: 'asc' } },
        _count: { select: { requests: true } },
      },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(workflows)
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to fetch workflows' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, entityType, description, isActive, steps } = body

    if (!name || !entityType) {
      return NextResponse.json({ error: 'name and entityType are required' }, { status: 400 })
    }

    const workflow = await prisma.approvalWorkflow.create({
      data: {
        name,
        entityType,
        description: description ?? null,
        isActive: isActive ?? true,
        steps: {
          create: (steps ?? []).map((s: { stepOrder: number; approverRole: string; approverName?: string; isRequired?: boolean }) => ({
            stepOrder: s.stepOrder,
            approverRole: s.approverRole,
            approverName: s.approverName ?? null,
            isRequired: s.isRequired ?? true,
          })),
        },
      },
      include: { steps: { orderBy: { stepOrder: 'asc' } } },
    })
    return NextResponse.json(workflow, { status: 201 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to create workflow' }, { status: 500 })
  }
}
