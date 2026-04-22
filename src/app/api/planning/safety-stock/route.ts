import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const rules = await (prisma as any).safetyStockRule.findMany({
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(rules)
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    // Bulk import: array of rules
    if (Array.isArray(body)) {
      const created = await (prisma as any).safetyStockRule.createMany({
        data: body.map((r: {
          productName?: string
          sku?: string
          storeId?: string
          storeName?: string
          minQty?: number
          maxQty?: number
          reorderPoint?: number
          reorderQty?: number
          leadTimeDays?: number
          method?: string
        }) => ({
          productName:  r.productName ?? null,
          sku:          r.sku ?? null,
          storeId:      r.storeId ?? null,
          storeName:    r.storeName ?? null,
          minQty:       Number(r.minQty ?? 0),
          maxQty:       Number(r.maxQty ?? 0),
          reorderPoint: Number(r.reorderPoint ?? 0),
          reorderQty:   Number(r.reorderQty ?? r.minQty ?? 0),
          leadTimeDays: Number(r.leadTimeDays ?? 7),
          isActive:     true,
        })),
        skipDuplicates: false,
      })
      return NextResponse.json({ count: created.count }, { status: 201 })
    }

    // Single rule
    const rule = await (prisma as any).safetyStockRule.create({
      data: {
        productName:  body.productName ?? null,
        sku:          body.sku ?? null,
        storeId:      body.storeId ?? null,
        storeName:    body.storeName ?? null,
        minQty:       Number(body.minQty ?? 0),
        maxQty:       Number(body.maxQty ?? 0),
        reorderPoint: Number(body.reorderPoint ?? 0),
        reorderQty:   Number(body.reorderQty ?? body.minQty ?? 0),
        leadTimeDays: Number(body.leadTimeDays ?? 7),
        isActive:     body.isActive ?? true,
      },
    })
    return NextResponse.json(rule, { status: 201 })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
