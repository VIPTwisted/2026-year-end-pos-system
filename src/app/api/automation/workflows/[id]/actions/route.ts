import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const actions = await prisma.automationAction.findMany({
    where: { workflowId: id },
    orderBy: { position: 'asc' },
  })
  return NextResponse.json(actions)
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const existing = await prisma.automationAction.count({ where: { workflowId: id } })
  const action = await prisma.automationAction.create({
    data: {
      workflowId: id,
      actionType: body.actionType,
      config: JSON.stringify(body.config ?? {}),
      position: body.position ?? existing,
    },
  })
  return NextResponse.json(action, { status: 201 })
}
