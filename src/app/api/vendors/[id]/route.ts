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
      invoices: {
        include: { lines: true, settlements: true },
        orderBy: { invoiceDate: 'desc' },
      },
      payments: {
        include: { settlements: true },
        orderBy: { paymentDate: 'desc' },
      },
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

  // Check vendor exists
  const existing = await prisma.vendor.findUnique({ where: { id } })
  if (!existing) {
    return NextResponse.json({ error: 'Vendor not found' }, { status: 404 })
  }

  const updatable = [
    'name', 'email', 'phone', 'address', 'city', 'state', 'zip',
    'paymentTerms', 'paymentMethod', 'creditLimit', 'isActive', 'notes',
  ] as const

  // Build update data from allowed fields only
  type VendorUpdateFields = {
    name?: string; email?: string; phone?: string; address?: string
    city?: string; state?: string; zip?: string; paymentTerms?: string
    paymentMethod?: string; creditLimit?: number; isActive?: boolean; notes?: string
  }
  const data: VendorUpdateFields = {}
  for (const field of updatable) {
    if (field in body) (data as Record<string, unknown>)[field] = body[field]
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: 'No updatable fields provided' }, { status: 400 })
  }

  const vendor = await prisma.vendor.update({
    where: { id },
    data,
    include: { vendorGroup: true },
  })

  return NextResponse.json(vendor)
}
