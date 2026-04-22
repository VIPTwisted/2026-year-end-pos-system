import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const contents = await prisma.warehouseBinContent.findMany({
    where: { binId: id },
    include: { product: { select: { id: true, name: true, sku: true, unit: true } } },
    orderBy: { lastUpdated: 'desc' },
  })
  return NextResponse.json(contents)
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: binId } = await params
  const body = await req.json()

  // findFirst — no binId_productId compound unique on WarehouseBinContent
  const existing = await prisma.warehouseBinContent.findFirst({
    where: { binId, productId: body.productId },
  })

  let content
  if (existing) {
    const newQty = existing.quantity + (body.quantityDelta ?? 0)
    content = await prisma.warehouseBinContent.update({
      where: { id: existing.id },
      data: { quantity: newQty < 0 ? 0 : newQty, lastUpdated: new Date() },
    })
  } else {
    content = await prisma.warehouseBinContent.create({
      data: {
        binId,
        productId: body.productId,
        quantity: body.quantity ?? 0,
        minQty: body.minQty ?? 0,
        maxQty: body.maxQty ?? null,
        lotNo: body.lotNo ?? null,
        serialNo: body.serialNo ?? null,
        isFixed: body.isFixed ?? false,
        isDefault: body.isDefault ?? false,
      },
    })
  }

  // Update bin isEmpty flag
  const totalQty = await prisma.warehouseBinContent.aggregate({
    where: { binId },
    _sum: { quantity: true },
  })
  await prisma.warehouseBin.update({
    where: { id: binId },
    data: { isEmpty: (totalQty._sum.quantity ?? 0) <= 0 },
  })

  return NextResponse.json(content, { status: existing ? 200 : 201 })
}
