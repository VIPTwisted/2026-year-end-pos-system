import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ productId: string }> },
) {
  const { productId } = await params
  const kit = await prisma.productKit.findFirst({
    where: { productId },
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
  if (!kit) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(kit)
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ productId: string }> },
) {
  const { productId } = await params
  const body = await req.json()

  const existing = await prisma.productKit.findFirst({ where: { productId } })
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const data: Record<string, unknown> = {}
  if (body.kitType !== undefined) data.kitType = body.kitType
  if (body.description !== undefined) data.description = body.description
  if (body.isActive !== undefined) data.isActive = body.isActive

  // Handle component mutations
  if (body.addComponents?.length) {
    const maxOrder = await prisma.kitComponent.aggregate({
      where: { kitId: existing.id },
      _max: { sortOrder: true },
    })
    let nextOrder = (maxOrder._max.sortOrder ?? -1) + 1
    await prisma.kitComponent.createMany({
      data: body.addComponents.map((c: {
        productId: string
        quantity?: number
        isOptional?: boolean
        chargeType?: string
        priceOffset?: number
      }) => ({
        kitId: existing.id,
        productId: c.productId,
        quantity: Number(c.quantity ?? 1),
        isOptional: c.isOptional ?? false,
        chargeType: c.chargeType || 'included',
        priceOffset: Number(c.priceOffset ?? 0),
        sortOrder: nextOrder++,
      })),
    })
  }
  if (body.removeComponentIds?.length) {
    await prisma.kitComponent.deleteMany({
      where: {
        kitId: existing.id,
        id: { in: body.removeComponentIds },
      },
    })
  }

  const kit = await prisma.productKit.update({
    where: { id: existing.id },
    data,
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
  return NextResponse.json(kit)
}
