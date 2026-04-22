import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')
    const storeId = searchParams.get('storeId')
    const periods = await prisma.fiscalPosSession.findMany({
      where: {
        ...(status ? { status } : {}),
        ...(storeId ? { storeId } : {}),
      },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(periods)
  } catch (error) {
    console.error('[GET /api/fiscal/periods]', error)
    return NextResponse.json({ error: 'Failed to fetch periods' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, storeId, storeName, startDate } = body
    if (!name || !startDate) {
      return NextResponse.json({ error: 'name and startDate are required' }, { status: 400 })
    }
    const period = await prisma.fiscalPosSession.create({
      data: {
        name,
        storeId: storeId ?? null,
        storeName: storeName ?? null,
        startDate: new Date(startDate),
        status: 'open',
      },
    })
    return NextResponse.json(period, { status: 201 })
  } catch (error) {
    console.error('[POST /api/fiscal/periods]', error)
    return NextResponse.json({ error: 'Failed to create period' }, { status: 500 })
  }
}
