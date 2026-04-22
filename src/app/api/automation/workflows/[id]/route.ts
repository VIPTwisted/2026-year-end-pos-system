import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const workflow = await prisma.automationWorkflow.findUnique({
    where: { id },
    include: { actions: { orderBy: { position: 'asc' } } },
  })
  if (!workflow) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const runs = await prisma.workflowRun.findMany({
    where: { workflowId: id },
    orderBy: { createdAt: 'desc' },
    take: 20,
  })
  return NextResponse.json({ ...workflow, runs })
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const updated = await prisma.automationWorkflow.update({
    where: { id },
    data: {
      name: body.name,
      description: body.description,
      trigger: body.trigger,
      conditions: body.conditions !== undefined ? JSON.stringify(body.conditions) : undefined,
      isActive: body.isActive,
    },
    include: { actions: { orderBy: { position: 'asc' } } },
  })
  return NextResponse.json(updated)
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await prisma.automationWorkflow.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
