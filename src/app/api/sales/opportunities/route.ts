import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const stage = searchParams.get('stage')
    const owner = searchParams.get('owner')
    const where: Record<string, string> = {}
    if (stage && stage !== 'all') where.salesStage = stage
    if (owner) where.ownerName = owner
    const opps = await prisma.salesOpportunity.findMany({
      where,
      include: { products: true, quotes: true },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(opps)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch opportunities' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const opp = await prisma.salesOpportunity.create({
      data: body,
      include: { products: true, quotes: true },
    })
    return NextResponse.json(opp, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create opportunity' }, { status: 500 })
  }
}
