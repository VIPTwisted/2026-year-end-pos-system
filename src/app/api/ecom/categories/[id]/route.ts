import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const category = await prisma.ecomCategory.update({
    where: { id },
    data: {
      ...(body.name !== undefined && { name: body.name }),
      ...(body.slug !== undefined && { slug: body.slug }),
      ...(body.description !== undefined && { description: body.description }),
      ...(body.parentId !== undefined && { parentId: body.parentId }),
      ...(body.imageUrl !== undefined && { imageUrl: body.imageUrl }),
      ...(body.metaTitle !== undefined && { metaTitle: body.metaTitle }),
      ...(body.metaDesc !== undefined && { metaDesc: body.metaDesc }),
      ...(body.position !== undefined && { position: body.position }),
      ...(body.isActive !== undefined && { isActive: body.isActive }),
      ...(body.productCount !== undefined && { productCount: body.productCount }),
    },
  })
  return NextResponse.json(category)
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await prisma.ecomCategory.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
