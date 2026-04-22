import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const type = searchParams.get('type')
    const status = searchParams.get('status')
    const channelId = searchParams.get('channelId')

    const where: Record<string, unknown> = {}
    if (type) where.discountType = type
    if (status) where.status = status
    if (channelId) where.priceGroupId = channelId

    const discounts = await prisma.discount.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        priceGroup: { select: { code: true, name: true } },
        _count: { select: { lines: true, usages: true } },
      },
    })
    return NextResponse.json(discounts)
  } catch (err) {
    console.error('[commerce/discounts GET]', err)
    return NextResponse.json([], { status: 200 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      name, discountCode, discountType = 'simple', status = 'active',
      priceGroupId, couponRequired = false, couponCode,
      discountMethod = 'percent', discountValue = 0,
      startDate, endDate, maxUsageCount, minPurchaseAmt,
    } = body as {
      name: string; discountCode: string; discountType?: string; status?: string
      priceGroupId?: string; couponRequired?: boolean; couponCode?: string
      discountMethod?: string; discountValue?: number
      startDate?: string; endDate?: string; maxUsageCount?: number; minPurchaseAmt?: number
    }

    if (!name?.trim()) return NextResponse.json({ error: 'name is required' }, { status: 400 })
    if (!discountCode?.trim()) return NextResponse.json({ error: 'discountCode is required' }, { status: 400 })

    const discount = await prisma.discount.create({
      data: {
        name: name.trim(),
        discountCode: discountCode.trim().toUpperCase(),
        discountType,
        status,
        priceGroupId: priceGroupId || null,
        couponRequired,
        couponCode: couponCode || null,
        discountMethod,
        discountValue: Number(discountValue),
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        maxUsageCount: maxUsageCount ?? null,
        minPurchaseAmt: minPurchaseAmt ?? null,
      },
    })
    return NextResponse.json(discount, { status: 201 })
  } catch (err: unknown) {
    const e = err as { code?: string }
    if (e.code === 'P2002') {
      return NextResponse.json({ error: 'Discount code already exists' }, { status: 409 })
    }
    console.error('[commerce/discounts POST]', err)
    return NextResponse.json({ error: 'Failed to create discount' }, { status: 500 })
  }
}
