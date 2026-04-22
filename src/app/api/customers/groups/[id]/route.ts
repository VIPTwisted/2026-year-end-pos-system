import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  _: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params
    const group = await prisma.customerGroup.findUnique({
      where: { id },
      include: {
        customers: {
          select: { id: true, firstName: true, lastName: true, email: true, isActive: true },
          orderBy: { firstName: 'asc' },
        },
        pricingRules: {
          include: {
            product: { select: { id: true, name: true, sku: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
        _count: { select: { customers: true, pricingRules: true } },
      },
    })
    if (!group) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(group)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params
    const body = await req.json() as {
      name?: string
      description?: string
      discountPct?: number
      isActive?: boolean
    }
    const allowed = ['name', 'description', 'discountPct', 'isActive']
    const data = Object.fromEntries(
      Object.entries(body).filter(([k]) => allowed.includes(k)),
    )
    const group = await prisma.customerGroup.update({ where: { id }, data })
    return NextResponse.json(group)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  _: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params
    // Unassign all customers first
    await prisma.customer.updateMany({
      where: { customerGroupId: id },
      data: { customerGroupId: null },
    })
    // Delete all pricing rules
    await prisma.groupPricingRule.deleteMany({ where: { groupId: id } })
    await prisma.customerGroup.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
