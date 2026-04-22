import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await req.json()
    const { groupName, productId, productName, sku, priceOverride, discountPct, isActive } = body
    const entry = await prisma.customerGroupPrice.update({
      where: { id },
      data: {
        ...(groupName !== undefined && { groupName }),
        ...(productId !== undefined && { productId }),
        ...(productName !== undefined && { productName }),
        ...(sku !== undefined && { sku }),
        ...(priceOverride !== undefined && { priceOverride: Number(priceOverride) }),
        ...(discountPct !== undefined && { discountPct: Number(discountPct) }),
        ...(isActive !== undefined && { isActive }),
      },
    })
    return NextResponse.json(entry)
  } catch (error) {
    console.error('PATCH /api/pricing/customer-groups/[id] error:', error)
    return NextResponse.json({ error: 'Failed to update customer group entry' }, { status: 500 })
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await prisma.customerGroupPrice.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('DELETE /api/pricing/customer-groups/[id] error:', error)
    return NextResponse.json({ error: 'Failed to delete customer group entry' }, { status: 500 })
  }
}
