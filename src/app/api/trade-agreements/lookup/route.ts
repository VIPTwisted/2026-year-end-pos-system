import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const productId = searchParams.get('productId')
  const customerId = searchParams.get('customerId')
  const qty = parseFloat(searchParams.get('qty') ?? '1')
  const type = searchParams.get('type') ?? 'SALES_PRICE'

  const now = new Date()

  // Find all active agreements matching type + customer (or "all")
  const agreements = await prisma.tradeAgreement.findMany({
    where: {
      isActive: true,
      type,
      OR: [
        { relation: 'all' },
        { relation: 'customer', customerId: customerId ?? undefined },
      ],
      AND: [
        { OR: [{ startDate: null }, { startDate: { lte: now } }] },
        { OR: [{ endDate: null }, { endDate: { gte: now } }] },
      ],
    },
    include: {
      lines: {
        where: {
          ...(productId ? { OR: [{ productId }, { productId: null }] } : {}),
          quantityMin: { lte: qty },
          AND: [
            { OR: [{ fromDate: null }, { fromDate: { lte: now } }] },
            { OR: [{ toDate: null }, { toDate: { gte: now } }] },
          ],
        },
      },
    },
  })

  // Collect matching lines
  type MatchLine = {
    agreementId: string
    productId: string | null
    amount: number
    pct: number | null
    quantityMin: number
    quantityMax: number | null
  }

  const matchingLines: MatchLine[] = []
  for (const ag of agreements) {
    for (const line of ag.lines) {
      // filter by product
      if (productId && line.productId && line.productId !== productId) continue
      // check qty max
      if (line.quantityMax != null && qty > line.quantityMax) continue
      matchingLines.push({
        agreementId: ag.id,
        productId: line.productId,
        amount: line.amount,
        pct: line.pct,
        quantityMin: line.quantityMin,
        quantityMax: line.quantityMax,
      })
    }
  }

  if (matchingLines.length === 0) return NextResponse.json({ result: null })

  // Best = most specific (product-specific > generic) then lowest price / highest discount
  const productSpecific = matchingLines.filter(l => l.productId === productId)
  const candidates = productSpecific.length > 0 ? productSpecific : matchingLines

  if (type === 'SALES_PRICE' || type === 'PURCHASE_PRICE') {
    // Lowest price wins
    const best = candidates.reduce((a, b) => (a.amount < b.amount ? a : b))
    return NextResponse.json({ result: best })
  } else {
    // Highest discount wins (by pct first, then amount)
    const best = candidates.reduce((a, b) => {
      const aPct = a.pct ?? 0
      const bPct = b.pct ?? 0
      if (aPct !== bPct) return aPct > bPct ? a : b
      return a.amount > b.amount ? a : b
    })
    return NextResponse.json({ result: best })
  }
}
