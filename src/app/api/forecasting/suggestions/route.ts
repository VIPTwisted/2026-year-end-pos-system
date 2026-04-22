import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')
    const urgency = searchParams.get('urgency')
    const storeId = searchParams.get('storeId')

    const suggestions = await prisma.replenishmentSuggestion.findMany({
      where: {
        ...(status ? { status } : {}),
        ...(urgency ? { urgency } : {}),
        ...(storeId ? { storeId } : {}),
      },
      orderBy: [
        { urgency: 'asc' },
        { createdAt: 'desc' },
      ],
    })

    return NextResponse.json(suggestions)
  } catch (error) {
    console.error('GET /api/forecasting/suggestions error:', error)
    return NextResponse.json({ error: 'Failed to fetch suggestions' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      productId, productName, sku, storeId, storeName,
      currentStock, reorderPoint, suggestedQty, urgency, notes,
    } = body

    if (currentStock === undefined || reorderPoint === undefined || suggestedQty === undefined) {
      return NextResponse.json(
        { error: 'currentStock, reorderPoint, suggestedQty are required' },
        { status: 400 }
      )
    }

    const suggestion = await prisma.replenishmentSuggestion.create({
      data: {
        productId, productName, sku, storeId, storeName,
        currentStock: Number(currentStock),
        reorderPoint: Number(reorderPoint),
        suggestedQty: Number(suggestedQty),
        urgency: urgency ?? 'normal',
        notes,
        status: 'pending',
      },
    })

    return NextResponse.json(suggestion, { status: 201 })
  } catch (error) {
    console.error('POST /api/forecasting/suggestions error:', error)
    return NextResponse.json({ error: 'Failed to create suggestion' }, { status: 500 })
  }
}
