import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const locationCode = searchParams.get('locationCode')
    const journalBatch = searchParams.get('journalBatch')
    const status = searchParams.get('status')

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {}
    if (locationCode) where.locationCode = locationCode
    if (journalBatch) where.journalBatch = journalBatch
    if (status) where.status = status

    const rows = await prisma.physicalInventoryJournal.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 500,
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
      journalBatch?: string
      itemId?: string
      productId?: string
      locationCode?: string
      qtyCalculated?: number
      qtyPhysical?: number
      description?: string
      unitCost?: number
      documentNo?: string
      storeId?: string
    }

    const productId = body.productId ?? body.itemId
    if (!productId) {
      return NextResponse.json({ error: 'productId is required' }, { status: 400 })
    }

    const qtyCalc = body.qtyCalculated ?? 0
    const qtyPhys = body.qtyPhysical ?? qtyCalc

    const row = await prisma.physicalInventoryJournal.create({
      data: {
        journalBatch: body.journalBatch ?? 'DEFAULT',
        productId,
        description: body.description ?? null,
        locationCode: body.locationCode ?? null,
        qtyCalculated: qtyCalc,
        qtyPhysInventory: qtyPhys,
        unitCost: body.unitCost ?? 0,
        documentNo: body.documentNo ?? null,
        storeId: body.storeId ?? null,
        status: 'open',
      },
    })

    return NextResponse.json(row, { status: 201 })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
