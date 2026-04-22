import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const program = await prisma.affiliateProgram.findUnique({
    where: { id },
    include: {
      tiers: { orderBy: { position: 'asc' } },
      _count: { select: { affiliates: true } },
    },
  })
  if (!program) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(program)
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const program = await prisma.affiliateProgram.update({ where: { id }, data: body })
  return NextResponse.json(program)
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await prisma.affiliateProgram.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
