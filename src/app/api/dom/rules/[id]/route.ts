import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const rule = await prisma.fulfillmentRule.findUnique({ where: { id } })
  if (!rule) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(rule)
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const allowed = ['name', 'description', 'ruleType', 'priority', 'isActive', 'conditions']
  const data = Object.fromEntries(Object.entries(body).filter(([k]) => allowed.includes(k)))
  const rule = await prisma.fulfillmentRule.update({ where: { id }, data })
  return NextResponse.json(rule)
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await prisma.fulfillmentRule.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
