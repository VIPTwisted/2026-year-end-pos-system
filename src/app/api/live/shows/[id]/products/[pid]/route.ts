import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string; pid: string }> }) {
  const { pid } = await params
  const body = await req.json()
  const product = await prisma.liveShowProduct.update({
    where: { id: pid },
    data: {
      ...(body.status !== undefined ? { status: body.status } : {}),
      ...(body.position !== undefined ? { position: body.position } : {}),
      ...(body.unitsSold !== undefined ? { unitsSold: body.unitsSold } : {}),
      ...(body.price !== undefined ? { price: parseFloat(body.price) } : {}),
      ...(body.salePrice !== undefined ? { salePrice: body.salePrice ? parseFloat(body.salePrice) : null } : {}),
      ...(body.imageUrl !== undefined ? { imageUrl: body.imageUrl } : {}),
    },
  })
  return NextResponse.json(product)
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string; pid: string }> }) {
  const { pid } = await params
  await prisma.liveShowProduct.delete({ where: { id: pid } })
  return NextResponse.json({ ok: true })
}
