import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const kits = await prisma.productKit.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      product: { select: { id: true, name: true, sku: true, salePrice: true } },
      _count: { select: { components: true } },
    },
  })
  return NextResponse.json(kits)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  if (!body.productId) {
    return NextResponse.json({ error: 'productId is required' }, { status: 400 })
  }

  const existing = await prisma.productKit.findFirst({
    where: { productId: body.productId },
  })
  if (existing) {
    return NextResponse.json(
      { error: 'A kit already exists for this product' },
      { status: 409 },
    )
  }

  const kit = await prisma.productKit.create({
    data: {
      productId: body.productId,
      name: body.name || body.productId,
      kitType: body.kitType || 'fixed',
      description: body.description?.trim() || null,
      isActive: body.isActive ?? true,
      components: body.components?.length
        ? {
            create: body.components.map(
              (c: {
                productId: string
                quantity?: number
                isOptional?: boolean
                chargeType?: string
                priceOffset?: number
                sortOrder?: number
              }, idx: number) => ({
                productId: c.productId,
                quantity: Number(c.quantity ?? 1),
                isOptional: c.isOptional ?? false,
                chargeType: c.chargeType || 'included',
                priceOffset: Number(c.priceOffset ?? 0),
                sortOrder: c.sortOrder ?? idx,
              }),
            ),
          }
        : undefined,
    },
    include: {
      product: { select: { id: true, name: true, sku: true, salePrice: true } },
      components: {
        include: {
          component: { select: { id: true, name: true, sku: true, salePrice: true } },
        },
        orderBy: { sortOrder: 'asc' },
      },
    },
  })
  return NextResponse.json(kit, { status: 201 })
}
