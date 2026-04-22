import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const sale = await prisma.flashSale.update({
    where: { id },
    data: {
      ...(body.name !== undefined ? { name: body.name } : {}),
      ...(body.productName !== undefined ? { productName: body.productName } : {}),
      ...(body.originalPrice !== undefined ? { originalPrice: parseFloat(body.originalPrice) } : {}),
      ...(body.salePrice !== undefined ? { salePrice: parseFloat(body.salePrice) } : {}),
      ...(body.quantity !== undefined ? { quantity: parseInt(body.quantity) } : {}),
      ...(body.soldQty !== undefined ? { soldQty: parseInt(body.soldQty) } : {}),
      ...(body.duration !== undefined ? { duration: parseInt(body.duration) } : {}),
      ...(body.status !== undefined ? { status: body.status } : {}),
    },
  })
  return NextResponse.json(sale)
}
