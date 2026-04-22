import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const entries = await prisma.customerGroupPrice.findMany({
      orderBy: [{ groupName: 'asc' }, { createdAt: 'desc' }],
    })

    // Group by groupName
    const grouped: Record<string, typeof entries> = {}
    for (const entry of entries) {
      if (!grouped[entry.groupName]) grouped[entry.groupName] = []
      grouped[entry.groupName].push(entry)
    }

    return NextResponse.json(grouped)
  } catch (error) {
    console.error('GET /api/pricing/customer-groups error:', error)
    return NextResponse.json({ error: 'Failed to fetch customer groups' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { groupName, productId, productName, sku, priceOverride, discountPct } = body
    if (!groupName || priceOverride === undefined) {
      return NextResponse.json({ error: 'groupName and priceOverride are required' }, { status: 400 })
    }
    const entry = await prisma.customerGroupPrice.create({
      data: {
        groupName,
        productId: productId ?? null,
        productName: productName ?? null,
        sku: sku ?? null,
        priceOverride: Number(priceOverride),
        discountPct: discountPct !== undefined ? Number(discountPct) : null,
      },
    })
    return NextResponse.json(entry, { status: 201 })
  } catch (error) {
    console.error('POST /api/pricing/customer-groups error:', error)
    return NextResponse.json({ error: 'Failed to create customer group entry' }, { status: 500 })
  }
}
