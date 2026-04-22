import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const search = searchParams.get('search') ?? ''
  const storeId = searchParams.get('storeId') ?? ''
  const statusFilter = searchParams.get('status') ?? ''
  const categoryId = searchParams.get('categoryId') ?? ''

  const where: Record<string, unknown> = {}
  if (storeId) where.storeId = storeId

  const inv = await prisma.inventory.findMany({
    where,
    include: {
      product: { include: { category: true } },
      store: { select: { id: true, name: true } },
    },
    orderBy: { product: { name: 'asc' } },
  })

  // Filter by search / category
  let filtered = inv.filter((i) => {
    const nameMatch = !search || i.product.name.toLowerCase().includes(search.toLowerCase()) || i.product.sku.toLowerCase().includes(search.toLowerCase())
    const catMatch = !categoryId || i.product.categoryId === categoryId
    return nameMatch && catMatch
  })

  // Compute status and attach
  const enriched = filtered.map((i) => {
    const available = i.quantity - i.reserved
    const reorderPoint = i.product.reorderPoint ?? 0
    let status = 'in_stock'
    if (i.quantity === 0) status = 'out_of_stock'
    else if (i.quantity <= reorderPoint) status = 'low_stock'
    return { ...i, available, status }
  })

  const finalFiltered = statusFilter
    ? enriched.filter((i) => i.status === statusFilter)
    : enriched

  return NextResponse.json(finalFiltered)
}
