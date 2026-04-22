import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const search = searchParams.get('search') || ''
    const isActive = searchParams.get('isActive')

    const where: Record<string, unknown> = {}
    if (isActive !== null && isActive !== '') {
      where.isActive = isActive === 'true'
    }
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { vendorCode: { contains: search } },
        { email: { contains: search } },
        { contactName: { contains: search } },
      ]
    }

    const vendors = await prisma.vendor.findMany({
      where,
      include: {
        _count: { select: { purchaseOrders: true } },
      },
      orderBy: { name: 'asc' },
    })

    return NextResponse.json(vendors)
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to fetch vendors' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    if (!body.name) {
      return NextResponse.json({ error: 'name is required' }, { status: 400 })
    }

    let vendorCode = body.vendorCode?.trim()
    if (!vendorCode) {
      const count = await prisma.vendor.count()
      vendorCode = `VND-${String(count + 1).padStart(4, '0')}`
    }

    const existing = await prisma.vendor.findUnique({ where: { vendorCode } })
    if (existing) {
      return NextResponse.json({ error: `Vendor code "${vendorCode}" already in use` }, { status: 409 })
    }

    const vendor = await prisma.vendor.create({
      data: {
        vendorCode,
        name: body.name,
        contactName: body.contactName || null,
        email: body.email || null,
        phone: body.phone || null,
        address: body.address || null,
        city: body.city || null,
        state: body.state || null,
        country: body.country || 'US',
        paymentTerms: body.paymentTerms || null,
        currency: body.currency || 'USD',
        leadTimeDays: body.leadTimeDays ?? 14,
        minimumOrderAmt: body.minimumOrderAmt ?? 0,
        notes: body.notes || null,
        isActive: body.isActive ?? true,
      },
    })

    return NextResponse.json(vendor, { status: 201 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to create vendor' }, { status: 500 })
  }
}
