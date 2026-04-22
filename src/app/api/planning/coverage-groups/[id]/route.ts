import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const group = await (prisma as any).coverageGroup.findUnique({ where: { id } })
    if (!group) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(group)
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await req.json()
    const group = await (prisma as any).coverageGroup.update({
      where: { id },
      data: {
        ...(body.name !== undefined && { name: body.name }),
        ...(body.coverageType !== undefined && { coverageType: body.coverageType }),
        ...(body.coverageDays !== undefined && { coverageDays: Number(body.coverageDays) }),
        ...(body.minQty !== undefined && { minQty: Number(body.minQty) }),
        ...(body.maxQty !== undefined && { maxQty: Number(body.maxQty) }),
        ...(body.reorderPoint !== undefined && { reorderPoint: Number(body.reorderPoint) }),
        ...(body.safetyStock !== undefined && { safetyStock: Number(body.safetyStock) }),
        ...(body.leadTimeDays !== undefined && { leadTimeDays: Number(body.leadTimeDays) }),
        ...(body.products !== undefined && { products: JSON.stringify(body.products) }),
      },
    })
    return NextResponse.json(group)
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    await (prisma as any).coverageGroup.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
