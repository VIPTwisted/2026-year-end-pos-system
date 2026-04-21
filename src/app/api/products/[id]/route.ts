import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      category: true,
      supplier: { select: { id: true, name: true } },
      inventory: { include: { store: { select: { id: true, name: true } } } },
    },
  })
  if (!product) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(product)
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const allowed = ['name','description','sku','barcode','costPrice','salePrice','unit','taxable','trackStock','isActive','imageUrl','reorderPoint','reorderQty','categoryId','supplierId']
  const data = Object.fromEntries(Object.entries(body).filter(([k]) => allowed.includes(k)))
  const product = await prisma.product.update({ where: { id }, data })
  return NextResponse.json(product)
}
