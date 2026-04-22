import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await req.json()
    const rule = await (prisma as any).safetyStockRule.update({
      where: { id },
      data: {
        ...(body.productName !== undefined && { productName: body.productName }),
        ...(body.locationName !== undefined && { locationName: body.locationName }),
        ...(body.calculationMethod !== undefined && { calculationMethod: body.calculationMethod }),
        ...(body.fixedQty !== undefined && { fixedQty: Number(body.fixedQty) }),
        ...(body.daysOfSupply !== undefined && { daysOfSupply: Number(body.daysOfSupply) }),
        ...(body.serviceLevel !== undefined && { serviceLevel: Number(body.serviceLevel) }),
        ...(body.currentStock !== undefined && { currentStock: Number(body.currentStock) }),
        ...(body.isActive !== undefined && { isActive: body.isActive }),
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
