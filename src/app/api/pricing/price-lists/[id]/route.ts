import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const priceList = await prisma.priceList.findUnique({
      where: { id },
      include: {
        customerGroup: { select: { id: true, name: true } },
        customer: { select: { id: true, firstName: true, lastName: true } },
        lines: {
          include: {
            product: { select: { id: true, sku: true, name: true, salePrice: true, imageUrl: true } },
          },
          orderBy: [{ productId: 'asc' }, { minQty: 'asc' }],
        },
      },
    })

    if (!priceList) {
      return NextResponse.json({ error: 'Price list not found' }, { status: 404 })
    }

    return NextResponse.json(priceList)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await req.json() as {
      name?: string
      code?: string
      currency?: string
      customerGroupId?: string | null
      customerId?: string | null
      startDate?: string | null
      endDate?: string | null
      isActive?: boolean
      notes?: string | null
    }

    const priceList = await prisma.priceList.update({
      where: { id },
      data: {
        ...(body.name !== undefined && { name: body.name.trim() }),
        ...(body.code !== undefined && { code: body.code.trim().toUpperCase() }),
        ...(body.currency !== undefined && { currency: body.currency }),
        ...(body.customerGroupId !== undefined && { customerGroupId: body.customerGroupId || null }),
        ...(body.customerId !== undefined && { customerId: body.customerId || null }),
        ...(body.startDate !== undefined && { startDate: body.startDate ? new Date(body.startDate) : null }),
        ...(body.endDate !== undefined && { endDate: body.endDate ? new Date(body.endDate) : null }),
        ...(body.isActive !== undefined && { isActive: body.isActive }),
        ...(body.notes !== undefined && { notes: body.notes || null }),
      },
      include: {
        customerGroup: { select: { id: true, name: true } },
        customer: { select: { id: true, firstName: true, lastName: true } },
        _count: { select: { lines: true } },
      },
    })

    return NextResponse.json(priceList)
  } catch (e) {
    console.error(e)
    const msg = e instanceof Error && e.message.includes('Unique constraint')
      ? 'A price list with that code already exists'
      : 'Internal server error'
    return NextResponse.json({ error: msg }, { status: msg.includes('code') ? 409 : 500 })
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await prisma.priceList.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
