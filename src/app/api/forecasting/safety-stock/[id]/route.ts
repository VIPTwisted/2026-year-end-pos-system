import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await req.json()

    const rule = await prisma.safetyStockRule.update({
      where: { id },
      data: {
        ...(body.productName !== undefined ? { productName: body.productName } : {}),
        ...(body.sku !== undefined ? { sku: body.sku } : {}),
        ...(body.storeName !== undefined ? { storeName: body.storeName } : {}),
        ...(body.minQty !== undefined ? { minQty: Number(body.minQty) } : {}),
        ...(body.maxQty !== undefined ? { maxQty: Number(body.maxQty) } : {}),
        ...(body.reorderPoint !== undefined ? { reorderPoint: Number(body.reorderPoint) } : {}),
        ...(body.reorderQty !== undefined ? { reorderQty: Number(body.reorderQty) } : {}),
        ...(body.leadTimeDays !== undefined ? { leadTimeDays: Number(body.leadTimeDays) } : {}),
        ...(body.isActive !== undefined ? { isActive: Boolean(body.isActive) } : {}),
        ...(body.lastTriggeredAt !== undefined ? { lastTriggeredAt: new Date(body.lastTriggeredAt) } : {}),
      },
    })

    return NextResponse.json(rule)
  } catch (error) {
    console.error('PATCH /api/forecasting/safety-stock/[id] error:', error)
    return NextResponse.json({ error: 'Failed to update rule' }, { status: 500 })
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await prisma.safetyStockRule.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('DELETE /api/forecasting/safety-stock/[id] error:', error)
    return NextResponse.json({ error: 'Failed to delete rule' }, { status: 500 })
  }
}
