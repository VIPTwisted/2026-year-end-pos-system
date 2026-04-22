import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const items = await prisma.hazmatItem.findMany({
      orderBy: { itemNo: 'asc' },
    })
    return NextResponse.json(items)
  } catch (err) {
    console.error('GET /api/products/hazmat', err)
    return NextResponse.json({ error: 'Failed to fetch hazmat items' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { itemNo, description, unNo, hazardClass, packingGroup, flashPoint, properShippingName, regulatoryBody } = body

    const item = await prisma.hazmatItem.create({
      data: {
        itemNo,
        description: description ?? null,
        unNo: unNo ?? null,
        hazardClass: hazardClass ?? null,
        packingGroup: packingGroup ?? null,
        flashPoint: flashPoint !== undefined && flashPoint !== '' ? parseFloat(flashPoint) : null,
        properShippingName: properShippingName ?? null,
        regulatoryBody: regulatoryBody ?? null,
      },
    })

    return NextResponse.json(item, { status: 201 })
  } catch (err) {
    console.error('POST /api/products/hazmat', err)
    return NextResponse.json({ error: 'Failed to create hazmat item' }, { status: 500 })
  }
}
