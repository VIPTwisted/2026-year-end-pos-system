import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const catalogId = searchParams.get('catalogId')
  const categories = await prisma.ecomCategory.findMany({
    where: catalogId ? { catalogId } : undefined,
    orderBy: [{ position: 'asc' }, { createdAt: 'asc' }],
  })
  return NextResponse.json(categories)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const category = await prisma.ecomCategory.create({
    data: {
      catalogId: body.catalogId,
      name: body.name,
      slug: body.slug,
      description: body.description ?? null,
      parentId: body.parentId ?? null,
      imageUrl: body.imageUrl ?? null,
      metaTitle: body.metaTitle ?? null,
      metaDesc: body.metaDesc ?? null,
      position: body.position ?? 0,
      isActive: body.isActive ?? true,
    },
  })
  return NextResponse.json(category, { status: 201 })
}
