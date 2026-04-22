import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const search = searchParams.get('search') ?? ''
  const status = searchParams.get('status') ?? ''
  const category = searchParams.get('category') ?? ''
  const rating = searchParams.get('rating') ?? ''

  const vendors = await prisma.vpVendor.findMany({
    where: {
      AND: [
        search ? {
          OR: [
            { name: { contains: search } },
            { vendorNumber: { contains: search } },
            { email: { contains: search } },
          ],
        } : {},
        status ? { status } : {},
        category ? { category } : {},
        rating ? { rating: parseInt(rating) } : {},
      ],
    },
    include: {
      _count: { select: { purchaseOrders: true, invoices: true } },
    },
    orderBy: { name: 'asc' },
  })

  return NextResponse.json(vendors)
}

export async function POST(req: NextRequest) {
  const body = await req.json()

  if (!body.name) {
    return NextResponse.json({ error: 'name is required' }, { status: 400 })
  }

  const count = await prisma.vpVendor.count()
  const vendorNumber = `VND-${String(count + 1).padStart(6, '0')}`

  const vendor = await prisma.vpVendor.create({
    data: {
      name:         body.name,
      vendorNumber,
      taxId:        body.taxId ?? null,
      email:        body.email ?? null,
      phone:        body.phone ?? null,
      website:      body.website ?? null,
      address:      body.address ?? null,
      city:         body.city ?? null,
      state:        body.state ?? null,
      zip:          body.zip ?? null,
      country:      body.country ?? 'US',
      paymentTerms: body.paymentTerms ?? 'NET30',
      currency:     body.currency ?? 'USD',
      status:       body.status ?? 'active',
      category:     body.category ?? null,
      rating:       body.rating ?? 3,
    },
  })

  return NextResponse.json(vendor, { status: 201 })
}
