import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const flow = await prisma.orchestrationFlow.findUnique({
    where: { id },
    include: {
      runs: {
        orderBy: { startedAt: 'desc' },
        take: 20,
      },
    },
  })
  if (!flow) return NextResponse.json({ error: 'not found' }, { status: 404 })
  return NextResponse.json(flow)
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const { action, ...rest } = body

  if (action === 'activate') {
    const flow = await prisma.orchestrationFlow.update({ where: { id }, data: { status: 'active' } })
    return NextResponse.json(flow)
  }
  if (action === 'deactivate') {
    const flow = await prisma.orchestrationFlow.update({ where: { id }, data: { status: 'inactive' } })
    return NextResponse.json(flow)
  }
  if (action === 'run') {
    const run = await prisma.orchestrationFlowRun.create({
      data: { flowId: id, status: 'running', currentStep: 1 },
    })
    // Simulate immediate completion for demo
    const completed = await prisma.orchestrationFlowRun.update({
      where: { id: run.id },
      data: { status: 'completed', endedAt: new Date() },
    })
    return NextResponse.json(completed)
  }

  const allowed = ['name', 'description', 'triggerType', 'stepsJson', 'conditionsJson', 'status']
  const data: Record<string, unknown> = {}
  for (const k of allowed) {
    if (k in rest) data[k] = rest[k]
  }
  const flow = await prisma.orchestrationFlow.update({ where: { id }, data })
  return NextResponse.json(flow)
}
