import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

function escapeCSVField(value: string | number | boolean | null | undefined): string {
  const str = value === null || value === undefined ? '' : String(value)
  // Quote fields that contain commas, quotes, or newlines
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

export async function GET(_req: NextRequest): Promise<NextResponse> {
  try {
    const products = await prisma.product.findMany({
      include: {
        category: true,
        supplier: true,
        inventory: {
          take: 1,
        },
      },
      orderBy: { createdAt: 'asc' },
    })

    const headers = [
      'id',
      'name',
      'sku',
      'barcode',
      'description',
      'salePrice',
      'costPrice',
      'category',
      'supplier',
      'isActive',
      'reorderPoint',
      'minAge',
      'requiresSerial',
      'currentStock',
    ]

    const csvLines: string[] = [headers.join(',')]

    for (const p of products) {
      const currentStock = p.inventory.length > 0 ? p.inventory[0].quantity : 0
      const row = [
        escapeCSVField(p.id),
        escapeCSVField(p.name),
        escapeCSVField(p.sku),
        escapeCSVField(p.barcode),
        escapeCSVField(p.description),
        escapeCSVField(p.salePrice),
        escapeCSVField(p.costPrice),
        escapeCSVField(p.category?.name),
        escapeCSVField(p.supplier?.name),
        escapeCSVField(p.isActive),
        escapeCSVField(p.reorderPoint),
        // @ts-ignore
        escapeCSVField(p.minAge),
        // @ts-ignore
        escapeCSVField(p.requiresSerial),
        escapeCSVField(currentStock),
      ]
      csvLines.push(row.join(','))
    }

    const csvContent = csvLines.join('\n')
    const timestamp = new Date().toISOString().slice(0, 10)

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="products-${timestamp}.csv"`,
      },
    })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
