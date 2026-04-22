import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const itemId = searchParams.get('itemId')

    const rows = await prisma.itemVariant.findMany({
      where: itemId ? { itemId } : undefined,
      orderBy: [{ itemId: 'asc' }, { variantCode: 'asc' }],
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
      variantCode: string
      description?: string
      salesPrice?: number
      inventory?: number
    }

    if (!body.itemId || !body.variantCode) {
      return NextResponse.json({ error: 'itemId and variantCode are required' }, { status: 400 })
    }

    const row = await prisma.itemVariant.create({
      data: {
        itemId: body.itemId,
        variantCode: body.variantCode.toUpperCase(),
        description: body.description ?? null,
        salesPrice: body.salesPrice ?? 0,
        inventory: body.inventory ?? 0,
      },
    })

    return NextResponse.json(row, { status: 201 })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
