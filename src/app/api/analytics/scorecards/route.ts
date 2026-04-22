import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const scorecards = await prisma.kpiScorecard.findMany({
    include: { metrics: { orderBy: { position: 'asc' } } },
    orderBy: [{ isDefault: 'desc' }, { createdAt: 'asc' }],
  })
  return NextResponse.json(scorecards)
}

export async function POST(req: Request) {
  const body = await req.json()
  const scorecard = await prisma.kpiScorecard.create({
    data: { name: body.name, description: body.description, isDefault: body.isDefault ?? false },
    include: { metrics: true },
  })
  return NextResponse.json(scorecard, { status: 201 })
}
