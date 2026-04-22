import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const orgId = searchParams.get('orgId') || ''

    const overrides = await prisma.b2BPriceOverride.findMany({
      where: {
        ...(orgId ? { orgId } : {}),
      },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(overrides)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Failed to fetch price overrides' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { orgId, productName, sku, priceType, value, minQty, startDate, endDate } = body

    const override = await prisma.b2BPriceOverride.create({
      data: {
        orgId: orgId ?? null,
        productName: productName ?? null,
        sku: sku ?? null,
        priceType: priceType ?? 'fixed',
        value: value ?? 0,
        minQty: minQty ?? 1,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        isActive: true,
      },
    })
    return NextResponse.json(override, { status: 201 })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Failed to create price override' }, { status: 500 })
  }
}
