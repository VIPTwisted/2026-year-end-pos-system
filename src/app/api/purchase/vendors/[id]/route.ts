import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const vendor = await prisma.vendor.findUnique({
    where: { id },
    include: {
      vendorGroup: true,
      invoices: { orderBy: { invoiceDate: 'desc' }, take: 20 },
      purchaseOrders: { orderBy: { createdAt: 'desc' }, take: 10 },
    },
  })

  if (!vendor) {
    return NextResponse.json({ error: 'Vendor not found' }, { status: 404 })
  }

  return NextResponse.json(vendor)
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await req.json()

  const existing = await prisma.vendor.findUnique({ where: { id } })
  if (!existing) {
    return NextResponse.json({ error: 'Vendor not found' }, { status: 404 })
  }

  // If vendorCode is changing, check uniqueness
  if (body.vendorCode && body.vendorCode !== existing.vendorCode) {
    const conflict = await prisma.vendor.findUnique({ where: { vendorCode: body.vendorCode } })
    if (conflict) {
      return NextResponse.json(
        { error: `Vendor Code "${body.vendorCode}" is already in use` },
        { status: 409 }
      )
    }
  }

  const vendor = await prisma.vendor.update({
    where: { id },
    data: {
      ...(body.vendorCode    !== undefined && { vendorCode:    body.vendorCode.trim() }),
      ...(body.name          !== undefined && { name:          body.name.trim() }),
      ...(body.vendorGroupId !== undefined && { vendorGroupId: body.vendorGroupId }),
      ...(body.email         !== undefined && { email:         body.email }),
      ...(body.phone         !== undefined && { phone:         body.phone }),
      ...(body.address       !== undefined && { address:       body.address }),
      ...(body.city          !== undefined && { city:          body.city }),
      ...(body.state         !== undefined && { state:         body.state }),
      ...(body.zip           !== undefined && { zip:           body.zip }),
      ...(body.taxId         !== undefined && { taxId:         body.taxId }),
      ...(body.paymentTerms  !== undefined && { paymentTerms:  body.paymentTerms }),
      ...(body.paymentMethod !== undefined && { paymentMethod: body.paymentMethod }),
      ...(body.currency      !== undefined && { currency:      body.currency }),
      ...(body.creditLimit   !== undefined && { creditLimit:   body.creditLimit }),
      ...(body.isActive      !== undefined && { isActive:      body.isActive }),
      ...(body.notes         !== undefined && { notes:         body.notes }),
    },
  })

  return NextResponse.json(vendor)
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const existing = await prisma.vendor.findUnique({
    where: { id },
    include: { invoices: { take: 1 }, purchaseOrders: { take: 1 } },
  })

  if (!existing) {
    return NextResponse.json({ error: 'Vendor not found' }, { status: 404 })
  }

  if (existing.invoices.length > 0 || existing.purchaseOrders.length > 0) {
    return NextResponse.json(
      { error: 'Cannot delete vendor with associated invoices or purchase orders' },
      { status: 422 }
    )
  }

  await prisma.vendor.delete({ where: { id } })
  return NextResponse.json({ deleted: true })
}
