import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await req.json()
    const { orgId, productName, sku, priceType, value, minQty, startDate, endDate, isActive } = body

    const override = await prisma.b2BPriceOverride.update({
      where: { id },
      data: {
        ...(orgId !== undefined ? { orgId } : {}),
        ...(productName !== undefined ? { productName } : {}),
        ...(sku !== undefined ? { sku } : {}),
        ...(priceType !== undefined ? { priceType } : {}),
        ...(value !== undefined ? { value } : {}),
        ...(minQty !== undefined ? { minQty } : {}),
        ...(startDate !== undefined ? { startDate: startDate ? new Date(startDate) : null } : {}),
        ...(endDate !== undefined ? { endDate: endDate ? new Date(endDate) : null } : {}),
        ...(isActive !== undefined ? { isActive } : {}),
      },
    })
    return NextResponse.json(override)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Failed to update price override' }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    await prisma.b2BPriceOverride.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Failed to delete price override' }, { status: 500 })
  }
}
