import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const active = req.nextUrl.searchParams.get('active')
  const products = await prisma.product.findMany({
    where: active === 'true' ? { isActive: true } : undefined,
    include: { category: true },
    orderBy: { name: 'asc' },
  })
  return NextResponse.json(products)
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, sku, barcode, description, categoryId, costPrice, salePrice,
            unit, taxable, trackStock, isActive, reorderPoint, reorderQty, imageUrl, supplierId } = body

    if (!name?.trim()) return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    if (!sku?.trim()) return NextResponse.json({ error: 'SKU is required' }, { status: 400 })

    const product = await prisma.product.create({
      data: {
        name: name.trim(),
        sku: sku.trim(),
        barcode: barcode?.trim() || null,
        description: description?.trim() || null,
        categoryId: categoryId || null,
        costPrice: costPrice ?? 0,
        salePrice: salePrice ?? 0,
        unit: unit ?? 'each',
        taxable: taxable ?? true,
        trackStock: trackStock ?? true,
        isActive: isActive ?? true,
        reorderPoint: reorderPoint ?? null,
        reorderQty: reorderQty ?? null,
        imageUrl: imageUrl?.trim() || null,
        supplierId: supplierId || null,
      },
    })
    return NextResponse.json(product, { status: 201 })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    if (msg.includes('Unique constraint') && msg.includes('sku')) {
      return NextResponse.json({ error: 'A product with this SKU already exists' }, { status: 409 })
    }
    if (msg.includes('Unique constraint') && msg.includes('barcode')) {
      return NextResponse.json({ error: 'A product with this barcode already exists' }, { status: 409 })
    }
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
