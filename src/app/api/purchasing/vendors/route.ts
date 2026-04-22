import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const q = searchParams.get('q') ?? ''

    const vendors = await prisma.vendor.findMany({
      where: q
        ? {
            OR: [
              { name:       { contains: q } },
              { vendorCode: { contains: q } },
              { email:      { contains: q } },
            ],
          }
        : {},
      select: {
        id:           true,
        vendorCode:   true,
        name:         true,
        email:        true,
        phone:        true,
        address:      true,
        city:         true,
        state:        true,
        zip:          true,
        paymentTerms: true,
        paymentMethod:true,
        currency:     true,
        creditLimit:  true,
        isActive:     true,
      },
      orderBy: { name: 'asc' },
      take: 500,
    })

    return NextResponse.json(vendors)
  } catch (err) {
    console.error('[GET /api/purchasing/vendors]', err)
    return NextResponse.json({ error: 'Failed to fetch vendors', detail: String(err) }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      vendorCode, name, vendorGroupId,
      email, phone, address, city, state, zip,
      taxId, paymentTerms, paymentMethod, currency,
      creditLimit, isActive, notes,
    } = body

    if (!vendorCode || !name) {
      return NextResponse.json({ error: 'vendorCode and name are required' }, { status: 400 })
    }

    const vendor = await prisma.vendor.create({
      data: {
        vendorCode,
        name,
        vendorGroupId: vendorGroupId ?? null,
        email:         email         ?? null,
        phone:         phone         ?? null,
        address:       address       ?? null,
        city:          city          ?? null,
        state:         state         ?? null,
        zip:           zip           ?? null,
        taxId:         taxId         ?? null,
        paymentTerms:  paymentTerms  ?? null,
        paymentMethod: paymentMethod ?? null,
        currency:      currency      ?? 'USD',
        creditLimit:   creditLimit   ?? null,
        isActive:      isActive      ?? true,
        notes:         notes         ?? null,
      },
    })

    return NextResponse.json(vendor, { status: 201 })
  } catch (err) {
    console.error('[POST /api/purchasing/vendors]', err)
    return NextResponse.json({ error: 'Failed to create vendor', detail: String(err) }, { status: 500 })
  }
}
