import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const productId = searchParams.get('productId')
  const total = parseFloat(searchParams.get('total') ?? '0')
  const now = new Date()

  const discounts = await prisma.discount.findMany({
    where: {
      status: 'active',
      OR: [
        { startDate: null },
        { startDate: { lte: now } },
      ],
      AND: [
        {
          OR: [
            { endDate: null },
            { endDate: { gte: now } },
          ],
        },
      ],
    },
    include: { lines: true },
  })

  const applicable = discounts.filter(d => {
    // Check max usage
    if (d.maxUsageCount !== null && d.usageCount >= d.maxUsageCount) return false
    // Check minimum purchase for threshold
    if (d.discountType === 'threshold' && d.minPurchaseAmt !== null && total < d.minPurchaseAmt) return false
    // Check lines — if any line matches productId or lineType=all
    if (d.lines.length === 0) return true
    return d.lines.some(line => {
      if (line.lineType === 'all') return true
      if (line.lineType === 'product' && productId && line.productId === productId) return true
      return false
    })
  })

  return NextResponse.json(applicable)
}
