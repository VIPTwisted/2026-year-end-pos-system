import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const query = req.nextUrl.searchParams.get('q')?.trim()
    if (!query) return NextResponse.json({ error: 'q param required' }, { status: 400 })
    const products = await prisma.product.findMany({
      where: {
        isActive: true,
        OR: [
          { sku: { contains: query } },
          { barcode: { contains: query } },
          { name: { contains: query } },
        ],
      },
      include: { category: { select: { name: true } } },
      take: 10,
    })
    return NextResponse.json(products.map(p => ({
      id: p.id,
      sku: p.sku,
      barcode: p.barcode,
      name: p.name,
      salePrice: p.salePrice,
      taxable: p.taxable,
      unit: p.unit,
      category: p.category?.name ?? null,
      imageUrl: p.imageUrl,
    })))
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
