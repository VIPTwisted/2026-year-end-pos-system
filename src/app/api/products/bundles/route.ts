import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const bundles = await prisma.productBundle.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        product: { select: { id: true, name: true, sku: true, salePrice: true, isActive: true } },
        components: {
          include: {
            product: { select: { id: true, name: true, sku: true, salePrice: true } },
          },
        },
      },
    })
    return NextResponse.json(bundles)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      productId: string
      bundleType?: string
      components?: { productId: string; quantity?: number; isOptional?: boolean }[]
    }

    if (!body.productId) {
      return NextResponse.json({ error: 'productId is required' }, { status: 400 })
    }

    const existing = await prisma.productBundle.findUnique({
      where: { productId: body.productId },
    })
    if (existing) {
      return NextResponse.json(
        { error: 'A bundle already exists for this product' },
        { status: 409 },
      )
    }

    const bundle = await prisma.productBundle.create({
      data: {
        productId: body.productId,
        bundleType: body.bundleType ?? 'kit',
        components: body.components?.length
          ? {
              create: body.components.map(c => ({
                productId: c.productId,
                quantity: Number(c.quantity ?? 1),
                isOptional: c.isOptional ?? false,
              })),
            }
          : undefined,
      },
      include: {
        product: { select: { id: true, name: true, sku: true, salePrice: true, isActive: true } },
        components: {
          include: {
            product: { select: { id: true, name: true, sku: true, salePrice: true } },
          },
        },
      },
    })
    return NextResponse.json(bundle, { status: 201 })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
