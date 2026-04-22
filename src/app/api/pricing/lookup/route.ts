import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/pricing/lookup?customerId=&productId=&qty=
 * Returns the best applicable unit price for a customer/product/qty combo.
 * Priority: customer-specific list > group list > product base price
 */
export async function GET(req: NextRequest) {
  try {
    const sp = req.nextUrl.searchParams
    const customerId = sp.get('customerId')
    const productId = sp.get('productId')
    const qty = parseInt(sp.get('qty') ?? '1', 10) || 1

    if (!productId) {
      return NextResponse.json({ error: 'productId is required' }, { status: 400 })
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true, name: true, salePrice: true },
    })
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    const now = new Date()

    interface MatchedLine {
      unitPrice: number
      discountPct: number
      minQty: number
      priceListId: string
      priceListCode: string
      source: 'customer' | 'group' | 'base'
    }

    let matched: MatchedLine | null = null

    // 1. Customer-specific list
    if (customerId) {
      const custLists = await prisma.priceList.findMany({
        where: {
          customerId,
          isActive: true,
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
        include: {
          lines: {
            where: {
              productId,
              minQty: { lte: qty },
            },
            orderBy: { minQty: 'desc' },
            take: 1,
          },
        },
      })

      for (const list of custLists) {
        if (list.lines.length > 0) {
          const line = list.lines[0]
          matched = {
            unitPrice: line.unitPrice,
            discountPct: line.discountPct,
            minQty: line.minQty,
            priceListId: list.id,
            priceListCode: list.code,
            source: 'customer',
          }
          break
        }
      }

      // 2. Group list (if no customer-specific match)
      if (!matched) {
        const customer = await prisma.customer.findUnique({
          where: { id: customerId },
          select: { customerGroupId: true },
        })

        if (customer?.customerGroupId) {
          const groupLists = await prisma.priceList.findMany({
            where: {
              customerGroupId: customer.customerGroupId,
              isActive: true,
              OR: [{ startDate: null }, { startDate: { lte: now } }],
              AND: [{ OR: [{ endDate: null }, { endDate: { gte: now } }] }],
            },
            include: {
              lines: {
                where: {
                  productId,
                  minQty: { lte: qty },
                },
                orderBy: { minQty: 'desc' },
                take: 1,
              },
            },
          })

          for (const list of groupLists) {
            if (list.lines.length > 0) {
              const line = list.lines[0]
              matched = {
                unitPrice: line.unitPrice,
                discountPct: line.discountPct,
                minQty: line.minQty,
                priceListId: list.id,
                priceListCode: list.code,
                source: 'group',
              }
              break
            }
          }
        }
      }
    }

    const effectivePrice = matched
      ? matched.unitPrice * (1 - matched.discountPct / 100)
      : product.salePrice

    return NextResponse.json({
      productId: product.id,
      productName: product.name,
      basePrice: product.salePrice,
      effectivePrice,
      source: matched?.source ?? 'base',
      priceListCode: matched?.priceListCode ?? null,
      priceListId: matched?.priceListId ?? null,
      unitPrice: matched?.unitPrice ?? product.salePrice,
      discountPct: matched?.discountPct ?? 0,
      minQty: matched?.minQty ?? 1,
      qty,
    })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
