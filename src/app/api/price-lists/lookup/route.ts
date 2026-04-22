import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const productId = searchParams.get('productId')
  const customerId = searchParams.get('customerId')

  if (!productId) return NextResponse.json({ error: 'productId required' }, { status: 400 })

  const now = new Date()

  // Get customer's group to match price list restrictions
  let customerGroupId: string | null = null
  if (customerId) {
    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
      select: { customerGroupId: true },
    })
    customerGroupId = customer?.customerGroupId ?? null
  }

  // Find all active price lists with a line for this product
  const activeLists = await prisma.priceList.findMany({
    where: {
      isActive: true,
      OR: [{ startDate: null }, { startDate: { lte: now } }],
      AND: [{ OR: [{ endDate: null }, { endDate: { gte: now } }] }],
    },
    include: {
      lines: {
        where: {
          productId,
          OR: [{ startDate: null }, { startDate: { lte: now } }],
          AND: [{ OR: [{ endDate: null }, { endDate: { gte: now } }] }],
        },
        orderBy: { minQuantity: 'asc' },
      },
    },
    orderBy: [{ isDefault: 'asc' }], // non-default first, default last (lower priority)
  })

  // Filter by customer / group restriction
  const eligible = activeLists.filter(pl => {
    // Price list locked to a specific customer
    if (pl.customerId) return pl.customerId === customerId
    // Price list locked to a customer group
    if (pl.customerGroupId) return pl.customerGroupId === customerGroupId
    // No restriction — applies to all
    return true
  })

  // Pick the best (lowest unit price) line from eligible lists
  let bestPrice: number | null = null
  let bestListName: string | null = null

  for (const pl of eligible) {
    for (const line of pl.lines) {
      if (bestPrice === null || line.unitPrice < bestPrice) {
        bestPrice = line.unitPrice
        bestListName = pl.name
      }
    }
  }

  if (bestPrice === null) return NextResponse.json(null)
  return NextResponse.json({ price: bestPrice, priceListName: bestListName })
}
