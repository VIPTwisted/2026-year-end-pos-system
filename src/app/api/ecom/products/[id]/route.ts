import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const product = await prisma.ecomProduct.findUnique({
    where: { id },
    include: { ratings: { orderBy: { createdAt: 'desc' } } },
  })
  if (!product) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(product)
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const product = await prisma.ecomProduct.update({
    where: { id },
    data: {
      ...(body.name !== undefined && { name: body.name }),
      ...(body.slug !== undefined && { slug: body.slug }),
      ...(body.shortDesc !== undefined && { shortDesc: body.shortDesc }),
      ...(body.longDesc !== undefined && { longDesc: body.longDesc }),
      ...(body.sku !== undefined && { sku: body.sku }),
      ...(body.price !== undefined && { price: body.price }),
      ...(body.salePrice !== undefined && { salePrice: body.salePrice }),
      ...(body.categoryId !== undefined && { categoryId: body.categoryId }),
      ...(body.categoryName !== undefined && { categoryName: body.categoryName }),
      ...(body.imageUrls !== undefined && { imageUrls: JSON.stringify(body.imageUrls) }),
      ...(body.status !== undefined && { status: body.status }),
      ...(body.isFeatured !== undefined && { isFeatured: body.isFeatured }),
      ...(body.metaTitle !== undefined && { metaTitle: body.metaTitle }),
      ...(body.metaDesc !== undefined && { metaDesc: body.metaDesc }),
      ...(body.tags !== undefined && { tags: body.tags }),
      ...(body.specifications !== undefined && { specifications: JSON.stringify(body.specifications) }),
      ...(body.catalogId !== undefined && { catalogId: body.catalogId }),
    },
  })
  return NextResponse.json(product)
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await prisma.ecomProduct.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
