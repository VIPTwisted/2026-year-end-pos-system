import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const city = req.nextUrl.searchParams.get('city')
  const state = req.nextUrl.searchParams.get('state')
  const type = req.nextUrl.searchParams.get('type')

  const stores = await prisma.storeLocation.findMany({
    where: {
      ...(city ? { city: { contains: city } } : {}),
      ...(state ? { state } : {}),
      ...(type ? { storeType: type } : {}),
    },
    include: { features: true, hours: true },
    orderBy: { storeName: 'asc' },
  })
  return NextResponse.json(stores)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const store = await prisma.storeLocation.create({
    data: {
      storeCode: body.storeCode,
      storeName: body.storeName,
      storeType: body.storeType ?? 'retail',
      address: body.address ?? null,
      address2: body.address2 ?? null,
      city: body.city ?? null,
      state: body.state ?? null,
      zipCode: body.zipCode ?? null,
      country: body.country ?? 'US',
      latitude: body.latitude ?? null,
      longitude: body.longitude ?? null,
      phone: body.phone ?? null,
      email: body.email ?? null,
      managerName: body.managerName ?? null,
      squareFootage: body.squareFootage ?? null,
      isActive: body.isActive ?? true,
    },
  })
  return NextResponse.json(store, { status: 201 })
}
