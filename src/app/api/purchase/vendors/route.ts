import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const search   = searchParams.get('search')
  const blocked  = searchParams.get('blocked')
  const currency = searchParams.get('currency')
  const take     = parseInt(searchParams.get('take') ?? '200', 10)

  const where: Record<string, unknown> = {}

  if (search) {
    where.OR = [
      { name:       { contains: search } },
      { vendorCode: { contains: search } },
      { email:      { contains: search } },
      { phone:      { contains: search } },
    ]
  }
  if (blocked === 'yes') where.isActive = false
  if (blocked === 'no')  where.isActive = true
  if (currency) where.currency = currency

  const vendors = await prisma.vendor.findMany({
    where,
    include: {
      vendorGroup: true,
      invoices: { where: { status: { notIn: ['paid', 'cancelled'] } } },
    },
    orderBy: { vendorCode: 'asc' },
    take: Math.min(take, 500),
  })

  return NextResponse.json(vendors)
}

export async function POST(req: NextRequest) {
  const body = await req.json()

  if (!body.name?.trim()) {
    return NextResponse.json({ error: 'name is required' }, { status: 400 })
  }

  // Auto-generate vendorCode if not provided
  const vendorCode = body.vendorCode?.trim() || await generateVendorCode()

  // Check uniqueness
  const existing = await prisma.vendor.findUnique({ where: { vendorCode } })
  if (existing) {
    return NextResponse.json(
      { error: `Vendor Code "${vendorCode}" is already in use` },
      { status: 409 }
    )
  }

  const vendor = await prisma.vendor.create({
    data: {
      vendorCode,
      name:          body.name.trim(),
      vendorGroupId: body.vendorGroupId ?? null,
      email:         body.email         ?? null,
      phone:         body.phone         ?? null,
      address:       body.address       ?? null,
      city:          body.city          ?? null,
      state:         body.state         ?? null,
      zip:           body.zip           ?? null,
      taxId:         body.taxId         ?? null,
      paymentTerms:  body.paymentTerms  ?? null,
      paymentMethod: body.paymentMethod ?? null,
      currency:      body.currency      ?? 'USD',
      isActive:      typeof body.isActive === 'boolean' ? body.isActive : true,
      notes:         body.notes         ?? null,
    },
  })

  return NextResponse.json(vendor, { status: 201 })
}

async function generateVendorCode(): Promise<string> {
  const count = await prisma.vendor.count()
  return `V${String(count + 1).padStart(5, '0')}`
}
