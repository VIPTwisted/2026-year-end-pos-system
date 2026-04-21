import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const stores = await prisma.store.findMany({
    orderBy: { name: 'asc' },
    include: {
      _count: {
        select: {
          orders: true,
          employees: true,
        },
      },
    },
  })

  return NextResponse.json(stores)
}

export async function POST(req: NextRequest) {
  const body = await req.json()

  const {
    name,
    address,
    city,
    state,
    zip,
    phone,
    email,
    taxRate,
    currency,
  } = body as {
    name: string
    address?: string
    city?: string
    state?: string
    zip?: string
    phone?: string
    email?: string
    taxRate?: number
    currency?: string
  }

  if (!name) {
    return NextResponse.json({ error: 'name is required' }, { status: 400 })
  }

  const store = await prisma.store.create({
    data: {
      name,
      address: address ?? null,
      city: city ?? null,
      state: state ?? null,
      zip: zip ?? null,
      phone: phone ?? null,
      email: email ?? null,
      taxRate: taxRate ?? 0.0825,
      currency: currency ?? 'USD',
      isActive: true,
    },
  })

  return NextResponse.json(store, { status: 201 })
}
