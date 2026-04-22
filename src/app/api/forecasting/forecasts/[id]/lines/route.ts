import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const lines = await prisma.forecastLine.findMany({
      where: { forecastId: id },
      orderBy: { createdAt: 'asc' },
    })
    return NextResponse.json(lines)
  } catch (error) {
    console.error('GET /api/forecasting/forecasts/[id]/lines error:', error)
    return NextResponse.json({ error: 'Failed to fetch lines' }, { status: 500 })
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: forecastId } = await params
    const body = await req.json()
    const { productId, productName, sku, categoryId, forecastedQty, confidencePct, storeId, storeName } = body

    if (forecastedQty === undefined || forecastedQty === null) {
      return NextResponse.json({ error: 'forecastedQty is required' }, { status: 400 })
    }

    const line = await prisma.forecastLine.create({
      data: {
        forecastId,
        productId,
        productName,
        sku,
        categoryId,
        forecastedQty: Number(forecastedQty),
        confidencePct: confidencePct !== undefined ? Number(confidencePct) : null,
        storeId,
        storeName,
      },
    })

    return NextResponse.json(line, { status: 201 })
  } catch (error) {
    console.error('POST /api/forecasting/forecasts/[id]/lines error:', error)
    return NextResponse.json({ error: 'Failed to create line' }, { status: 500 })
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: forecastId } = await params
    const { searchParams } = new URL(req.url)
    const lineId = searchParams.get('lineId')

    if (!lineId) return NextResponse.json({ error: 'lineId query param required' }, { status: 400 })

    await prisma.forecastLine.deleteMany({
      where: { id: lineId, forecastId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('DELETE /api/forecasting/forecasts/[id]/lines error:', error)
    return NextResponse.json({ error: 'Failed to delete line' }, { status: 500 })
  }
}
