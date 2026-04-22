import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const vendor = await prisma.vendor.findUnique({
      where: { id },
      include: {
        _count: { select: { purchaseOrders: true } },
        scorecards: { orderBy: { period: 'desc' } },
        purchaseOrders: {
          include: { _count: { select: { lines: true } } },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    })

    if (!vendor) {
      return NextResponse.json({ error: 'Vendor not found' }, { status: 404 })
    }

    return NextResponse.json(vendor)
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to fetch vendor' }, { status: 500 })
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await req.json()

    const existing = await prisma.vendor.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Vendor not found' }, { status: 404 })
    }

    const vendor = await prisma.vendor.update({
      where: { id },
      data: {
        name: body.name ?? undefined,
        contactName: body.contactName ?? undefined,
        email: body.email ?? undefined,
        phone: body.phone ?? undefined,
        address: body.address ?? undefined,
        city: body.city ?? undefined,
        state: body.state ?? undefined,
        country: body.country ?? undefined,
        paymentTerms: body.paymentTerms ?? undefined,
        currency: body.currency ?? undefined,
        leadTimeDays: body.leadTimeDays ?? undefined,
        minimumOrderAmt: body.minimumOrderAmt ?? undefined,
        notes: body.notes ?? undefined,
        isActive: body.isActive ?? undefined,
      },
    })

    return NextResponse.json(vendor)
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to update vendor' }, { status: 500 })
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const poCount = await prisma.vendorPO.count({ where: { vendorId: id } })
    if (poCount > 0) {
      return NextResponse.json(
        { error: `Cannot delete: vendor has ${poCount} purchase order(s)` },
        { status: 409 }
      )
    }

    await prisma.vendor.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to delete vendor' }, { status: 500 })
  }
}
