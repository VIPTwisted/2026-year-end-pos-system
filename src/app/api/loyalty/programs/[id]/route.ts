import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const program = await prisma.loyaltyProgram.findUnique({
    where: { id },
    include: {
      tiers: { orderBy: { sortOrder: 'asc' } },
      _count: { select: { cards: true } },
    },
  })
  if (!program) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(program)
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const program = await prisma.loyaltyProgram.update({
    where: { id },
    data: {
      ...(body.name !== undefined && { name: body.name }),
      ...(body.description !== undefined && { description: body.description }),
      ...(body.status !== undefined && { status: body.status }),
      ...(body.startDate !== undefined && { startDate: body.startDate ? new Date(body.startDate) : null }),
      ...(body.endDate !== undefined && { endDate: body.endDate ? new Date(body.endDate) : null }),
    },
  })
  return NextResponse.json(program)
}
