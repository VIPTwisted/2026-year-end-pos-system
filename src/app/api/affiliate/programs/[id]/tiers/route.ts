import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const tiers = await prisma.affiliateTier.findMany({
    where: { programId: id },
    orderBy: { position: 'asc' },
  })
  return NextResponse.json(tiers)
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const count = await prisma.affiliateTier.count({ where: { programId: id } })
  const tier = await prisma.affiliateTier.create({
    data: { ...body, programId: id, position: count },
  })
  return NextResponse.json(tier, { status: 201 })
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: _programId } = await params
  const tid = req.nextUrl.searchParams.get('tid')
  if (!tid) return NextResponse.json({ error: 'tid required' }, { status: 400 })
  await prisma.affiliateTier.delete({ where: { id: tid } })
  return NextResponse.json({ ok: true })
}
