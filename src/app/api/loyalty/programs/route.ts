import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const programs = await prisma.loyaltyProgram.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      tiers: { orderBy: { sortOrder: 'asc' } },
      _count: { select: { cards: true } },
    },
  })
  return NextResponse.json(programs)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const program = await prisma.loyaltyProgram.create({
    data: {
      name: body.name,
      description: body.description ?? null,
      status: body.status ?? 'active',
      startDate: body.startDate ? new Date(body.startDate) : null,
      endDate: body.endDate ? new Date(body.endDate) : null,
    },
  })
  return NextResponse.json(program, { status: 201 })
}
