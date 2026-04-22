import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const storeId = searchParams.get('storeId')
    const isActiveParam = searchParams.get('isActive')

    const rules = await prisma.safetyStockRule.findMany({
      where: {
        ...(storeId ? { storeId } : {}),
        ...(isActiveParam !== null ? { isActive: isActiveParam === 'true' } : {}),
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(rules)
  } catch (error) {
    console.error('GET /api/forecasting/safety-stock error:', error)
    return NextResponse.json({ error: 'Failed to fetch safety stock rules' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      productId, productName, sku, storeId, storeName,
      minQty, maxQty, reorderPoint, reorderQty, leadTimeDays,
    } = body

    if (minQty === undefined || maxQty === undefined || reorderPoint === undefined || reorderQty === undefined) {
      return NextResponse.json({ error: 'minQty, maxQty, reorderPoint, reorderQty are required' }, { status: 400 })
    }

    const rule = await prisma.safetyStockRule.create({
      data: {
        productId, productName, sku, storeId, storeName,
        minQty: Number(minQty),
        maxQty: Number(maxQty),
        reorderPoint: Number(reorderPoint),
        reorderQty: Number(reorderQty),
        leadTimeDays: leadTimeDays !== undefined ? Number(leadTimeDays) : 7,
        isActive: true,
      },
    })

    return NextResponse.json(rule, { status: 201 })
  } catch (error) {
    console.error('POST /api/forecasting/safety-stock error:', error)
    return NextResponse.json({ error: 'Failed to create safety stock rule' }, { status: 500 })
  }
}
