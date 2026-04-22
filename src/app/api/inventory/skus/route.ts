import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const itemId = searchParams.get('itemId')
    const locationCode = searchParams.get('locationCode')

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {}
    if (itemId) where.itemId = itemId
    if (locationCode) where.locationCode = locationCode

    const rows = await prisma.stockkepingUnit.findMany({
      where,
      orderBy: [{ itemId: 'asc' }, { locationCode: 'asc' }],
    })

    return NextResponse.json(rows)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      itemId: string
      variantCode?: string
      locationCode: string
      reorderPoint?: number
      reorderQty?: number
      safetyStock?: number
    }

    if (!body.itemId || !body.locationCode) {
      return NextResponse.json({ error: 'itemId and locationCode are required' }, { status: 400 })
    }

    const row = await prisma.stockkepingUnit.create({
      data: {
        itemId: body.itemId,
        variantCode: body.variantCode ?? null,
        locationCode: body.locationCode,
        reorderPoint: body.reorderPoint ?? 0,
        reorderQty: body.reorderQty ?? 0,
        safetyStock: body.safetyStock ?? 0,
      },
    })

    return NextResponse.json(row, { status: 201 })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
