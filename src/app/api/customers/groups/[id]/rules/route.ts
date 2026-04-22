import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  _: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params
    const rules = await prisma.groupPricingRule.findMany({
      where: { groupId: id },
      include: {
        product: { select: { id: true, name: true, sku: true, salePrice: true } },
      },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(rules)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params
    const body = await req.json() as {
      productId?: string
      categoryId?: string
      priceOverride?: number
      discountPct?: number
    }

    if (!body.priceOverride && !body.discountPct) {
      return NextResponse.json(
        { error: 'Either priceOverride or discountPct must be provided' },
        { status: 400 },
      )
    }

    const rule = await prisma.groupPricingRule.create({
      data: {
        groupId: id,
        productId: body.productId ?? undefined,
        categoryId: body.categoryId ?? undefined,
        priceOverride: body.priceOverride ?? undefined,
        discountPct: body.discountPct ?? undefined,
      },
      include: {
        product: { select: { id: true, name: true, sku: true } },
      },
    })
    return NextResponse.json(rule, { status: 201 })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: groupId } = await params
    const sp = req.nextUrl.searchParams
    const ruleId = sp.get('ruleId')
    if (!ruleId) return NextResponse.json({ error: 'ruleId required' }, { status: 400 })
    await prisma.groupPricingRule.deleteMany({
      where: { id: ruleId, groupId },
    })
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
