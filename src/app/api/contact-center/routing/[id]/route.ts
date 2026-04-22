import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const rule = await prisma.routingRule.findUnique({ where: { id } })
  if (!rule) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(rule)
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const rule = await prisma.routingRule.update({
    where: { id },
    data: {
      name: body.name,
      channelType: body.channelType,
      priority: body.priority,
      isActive: body.isActive,
      conditions: body.conditions,
      action: body.action,
      targetQueue: body.targetQueue,
      targetAgent: body.targetAgent,
    },
  })
  return NextResponse.json(rule)
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await prisma.routingRule.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
