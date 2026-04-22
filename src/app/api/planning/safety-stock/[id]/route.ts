import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await req.json()
    const rule = await (prisma as any).safetyStockRule.update({
      where: { id },
      data: {
        ...(body.productName  !== undefined && { productName:  body.productName }),
        ...(body.sku          !== undefined && { sku:          body.sku }),
        ...(body.storeName    !== undefined && { storeName:    body.storeName }),
        ...(body.minQty       !== undefined && { minQty:       Number(body.minQty) }),
        ...(body.maxQty       !== undefined && { maxQty:       Number(body.maxQty) }),
        ...(body.reorderPoint !== undefined && { reorderPoint: Number(body.reorderPoint) }),
        ...(body.reorderQty   !== undefined && { reorderQty:   Number(body.reorderQty) }),
        ...(body.leadTimeDays !== undefined && { leadTimeDays: Number(body.leadTimeDays) }),
        ...(body.isActive     !== undefined && { isActive:     body.isActive }),
      },
    })
    return NextResponse.json(rule)
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    await (prisma as any).safetyStockRule.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
