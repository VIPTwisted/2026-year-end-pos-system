import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const catalogId = searchParams.get('catalogId')
  const status = searchParams.get('status')
  const categoryId = searchParams.get('categoryId')
  const isFeatured = searchParams.get('isFeatured')
  const search = searchParams.get('search')

  const products = await prisma.ecomProduct.findMany({
    where: {
      ...(catalogId && { catalogId }),
      ...(status && { status }),
      ...(categoryId && { categoryId }),
      ...(isFeatured !== null && { isFeatured: isFeatured === 'true' }),
      ...(search && {
        OR: [
          { name: { contains: search } },
          { sku: { contains: search } },
          { tags: { contains: search } },
        ],
      }),
    },
    include: {
      _count: { select: { ratings: true } },
    },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(products)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const product = await prisma.ecomProduct.create({
    data: {
      catalogId: body.catalogId ?? null,
      internalId: body.internalId ?? null,
      name: body.name,
      slug: body.slug,
      shortDesc: body.shortDesc ?? null,
      longDesc: body.longDesc ?? null,
      sku: body.sku ?? null,
      price: body.price ?? 0,
      salePrice: body.salePrice ?? null,
      categoryId: body.categoryId ?? null,
      categoryName: body.categoryName ?? null,
      imageUrls: body.imageUrls ? JSON.stringify(body.imageUrls) : '[]',
      status: body.status ?? 'draft',
      isFeatured: body.isFeatured ?? false,
      metaTitle: body.metaTitle ?? null,
      metaDesc: body.metaDesc ?? null,
      tags: body.tags ?? null,
      specifications: body.specifications ? JSON.stringify(body.specifications) : '{}',
    },
  })
  return NextResponse.json(product, { status: 201 })
}
