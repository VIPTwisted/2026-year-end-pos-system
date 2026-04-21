import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const vendors = await prisma.vendor.findMany({
    include: { vendorGroup: true },
    orderBy: { name: 'asc' },
  })
  return NextResponse.json(vendors)
}

export async function POST(req: NextRequest) {
  const body = await req.json()

  // Validate required fields
  if (!body.vendorCode || !body.name) {
    return NextResponse.json(
      { error: 'vendorCode and name are required' },
      { status: 400 }
    )
  }

  // Check vendorCode uniqueness
  const existing = await prisma.vendor.findUnique({
    where: { vendorCode: body.vendorCode },
  })
  if (existing) {
    return NextResponse.json(
      { error: `Vendor code "${body.vendorCode}" is already in use` },
      { status: 409 }
    )
  }

  const vendor = await prisma.vendor.create({
    data: {
      vendorCode:    body.vendorCode,
      name:          body.name,
      vendorGroupId: body.vendorGroupId ?? null,
      email:         body.email ?? null,
      phone:         body.phone ?? null,
      address:       body.address ?? null,
      city:          body.city ?? null,
      state:         body.state ?? null,
      zip:           body.zip ?? null,
      taxId:         body.taxId ?? null,
      paymentTerms:  body.paymentTerms ?? null,
      paymentMethod: body.paymentMethod ?? null,
      currency:      body.currency ?? 'USD',
      creditLimit:   body.creditLimit ?? null,
      isActive:      body.isActive ?? true,
      notes:         body.notes ?? null,
    },
    include: { vendorGroup: true },
  })

  return NextResponse.json(vendor, { status: 201 })
}
