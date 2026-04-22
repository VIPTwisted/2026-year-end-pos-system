import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const rule = await prisma.fulfillmentRule.findUnique({ where: { id } })
  if (!rule) return NextResponse.json({ error: 'not found' }, { status: 404 })
  return NextResponse.json(rule)
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()

  const allowed = ['name', 'ruleType', 'priority', 'isActive', 'description', 'conditionsJson', 'actionsJson']
  const data: Record<string, unknown> = {}
  for (const k of allowed) {
    if (k in body) data[k] = body[k]
  }
  const rule = await prisma.fulfillmentRule.update({ where: { id }, data })
  return NextResponse.json(rule)
}
