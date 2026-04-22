import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const sp = req.nextUrl.searchParams
    const customerId = sp.get('customerId')
    const productId = sp.get('productId')

    if (!customerId || !productId) {
      return NextResponse.json(
        { error: 'customerId and productId are required' },
        { status: 400 },
      )
    }

    const [customer, product] = await Promise.all([
      prisma.customer.findUnique({
        where: { id: customerId },
        include: {
          customerGroup: {
            include: {
              pricingRules: {
                where: { productId },
              },
            },
          },
        },
      }),
      prisma.product.findUnique({
        where: { id: productId },
        select: { id: true, salePrice: true, categoryId: true },
      }),
    ])

    if (!customer) return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
    if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 })

    const regularPrice = Number(product.salePrice)
    const group = customer.customerGroup

    if (!group) {
      return NextResponse.json({
        regularPrice,
        effectivePrice: regularPrice,
        discountPct: 0,
        source: 'regular' as const,
      })
    }

    // Check product-specific rule first
    const productRule = group.pricingRules.find(
      (r) => r.productId === productId,
    )

    if (productRule) {
      if (productRule.priceOverride !== null && productRule.priceOverride !== undefined) {
        const effectivePrice = Number(productRule.priceOverride)
        const discountPct =
          regularPrice > 0
            ? Math.round(((regularPrice - effectivePrice) / regularPrice) * 100 * 100) / 100
            : 0
        return NextResponse.json({
          regularPrice,
          effectivePrice,
          discountPct,
          source: 'product_rule' as const,
        })
      }
      if (productRule.discountPct !== null && productRule.discountPct !== undefined) {
        const pct = Number(productRule.discountPct)
        const effectivePrice = Math.round(regularPrice * (1 - pct / 100) * 100) / 100
        return NextResponse.json({
          regularPrice,
          effectivePrice,
          discountPct: pct,
          source: 'product_rule' as const,
        })
      }
    }

    // Check category-level rule if product has a category
    if (product.categoryId) {
      const categoryRules = await prisma.groupPricingRule.findMany({
        where: { groupId: group.id, categoryId: product.categoryId, productId: null },
      })
      const catRule = categoryRules[0]
      if (catRule) {
        if (catRule.priceOverride !== null && catRule.priceOverride !== undefined) {
          const effectivePrice = Number(catRule.priceOverride)
          const discountPct =
            regularPrice > 0
              ? Math.round(((regularPrice - effectivePrice) / regularPrice) * 100 * 100) / 100
              : 0
          return NextResponse.json({
            regularPrice,
            effectivePrice,
            discountPct,
            source: 'product_rule' as const,
          })
        }
        if (catRule.discountPct !== null && catRule.discountPct !== undefined) {
          const pct = Number(catRule.discountPct)
          const effectivePrice = Math.round(regularPrice * (1 - pct / 100) * 100) / 100
          return NextResponse.json({
            regularPrice,
            effectivePrice,
            discountPct: pct,
            source: 'product_rule' as const,
          })
        }
      }
    }

    // Fall back to group-level flat discount
    const groupDiscount = Number(group.discountPct)
    if (groupDiscount > 0) {
      const effectivePrice = Math.round(regularPrice * (1 - groupDiscount / 100) * 100) / 100
      return NextResponse.json({
        regularPrice,
        effectivePrice,
        discountPct: groupDiscount,
        source: 'group_discount' as const,
      })
    }

    return NextResponse.json({
      regularPrice,
      effectivePrice: regularPrice,
      discountPct: 0,
      source: 'regular' as const,
    })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
