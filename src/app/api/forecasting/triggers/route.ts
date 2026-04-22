import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const resolved = searchParams.get('resolved')

    const triggers = await prisma.reorderTrigger.findMany({
      where: {
        ...(resolved !== null ? { resolved: resolved === 'true' } : {}),
      },
      orderBy: [
        { resolved: 'asc' },
        { triggeredAt: 'desc' },
      ],
    })

    return NextResponse.json(triggers)
  } catch (error) {
    console.error('GET /api/forecasting/triggers error:', error)
    return NextResponse.json({ error: 'Failed to fetch triggers' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      productId, productName, sku, storeId,
      triggerType, stockAtTrigger, reorderPoint,
    } = body

    if (!triggerType || stockAtTrigger === undefined || reorderPoint === undefined) {
      return NextResponse.json(
        { error: 'triggerType, stockAtTrigger, reorderPoint are required' },
        { status: 400 }
      )
    }

    const trigger = await prisma.reorderTrigger.create({
      data: {
        productId, productName, sku, storeId,
        triggerType,
        stockAtTrigger: Number(stockAtTrigger),
        reorderPoint: Number(reorderPoint),
      },
    })

    return NextResponse.json(trigger, { status: 201 })
  } catch (error) {
    console.error('POST /api/forecasting/triggers error:', error)
    return NextResponse.json({ error: 'Failed to create trigger' }, { status: 500 })
  }
}
