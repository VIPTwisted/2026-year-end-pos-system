import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const r = await prisma.replenishmentRule.update({ where: { id }, data: body })
  return NextResponse.json(r)
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await prisma.replenishmentRule.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
