import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const competitors = await prisma.competitor.findMany({
      orderBy: { name: 'asc' },
    })
    return NextResponse.json(competitors)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch competitors' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const competitor = await prisma.competitor.create({ data: body })
    return NextResponse.json(competitor, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create competitor' }, { status: 500 })
  }
}
