import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const status = req.nextUrl.searchParams.get('status')
  const workflows = await prisma.automationWorkflow.findMany({
    where: status === 'active' ? { isActive: true } : status === 'inactive' ? { isActive: false } : undefined,
    include: { actions: { orderBy: { position: 'asc' } } },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(workflows)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { name, description, trigger, conditions, actions } = body
  if (!name || !trigger) return NextResponse.json({ error: 'name and trigger required' }, { status: 400 })

  const workflow = await prisma.automationWorkflow.create({
    data: {
      name,
      description: description ?? null,
      trigger,
      conditions: JSON.stringify(conditions ?? []),
      actions: actions?.length
        ? {
            create: (actions as Array<{ actionType: string; config: Record<string, unknown>; position: number }>).map(
              (a, i) => ({
                actionType: a.actionType,
                config: JSON.stringify(a.config ?? {}),
                position: a.position ?? i,
              })
            ),
          }
        : undefined,
    },
    include: { actions: { orderBy: { position: 'asc' } } },
  })
  return NextResponse.json(workflow, { status: 201 })
}
