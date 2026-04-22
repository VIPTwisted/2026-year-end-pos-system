import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const rule = await prisma.businessRule.findUnique({ where: { id } })
  if (!rule) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(rule)
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const rule = await prisma.businessRule.update({
    where: { id },
    data: {
      name: body.name,
      entity: body.entity,
      ruleType: body.ruleType,
      conditions: body.conditions !== undefined ? JSON.stringify(body.conditions) : undefined,
      action: body.action !== undefined ? JSON.stringify(body.action) : undefined,
      priority: body.priority,
      isActive: body.isActive,
    },
  })
  return NextResponse.json(rule)
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await prisma.businessRule.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
