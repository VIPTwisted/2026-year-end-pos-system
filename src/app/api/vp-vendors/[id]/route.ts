import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const vendor = await prisma.vpVendor.findUnique({
    where: { id },
    include: {
      contacts: { orderBy: { role: 'asc' } },
      performanceData: { orderBy: { period: 'desc' }, take: 1 },
      _count: { select: { purchaseOrders: true, invoices: true } },
    },
  })

  if (!vendor) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(vendor)
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await req.json()

  const vendor = await prisma.vpVendor.update({
    where: { id },
    data: {
      name:         body.name,
      taxId:        body.taxId,
      email:        body.email,
      phone:        body.phone,
      website:      body.website,
      address:      body.address,
      city:         body.city,
      state:        body.state,
      zip:          body.zip,
      country:      body.country,
      paymentTerms: body.paymentTerms,
      currency:     body.currency,
      status:       body.status,
      category:     body.category,
      rating:       body.rating,
    },
  })

  return NextResponse.json(vendor)
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  await prisma.vpVendor.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
