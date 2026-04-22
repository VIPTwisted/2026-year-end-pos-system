import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const store = await prisma.storeLocation.findUnique({
    where: { id },
    include: { features: true, hours: { orderBy: { dayOfWeek: 'asc' } } },
  })
  if (!store) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(store)
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const store = await prisma.storeLocation.update({
    where: { id },
    data: {
      storeName: body.storeName,
      storeType: body.storeType,
      address: body.address,
      address2: body.address2,
      city: body.city,
      state: body.state,
      zipCode: body.zipCode,
      latitude: body.latitude,
      longitude: body.longitude,
      phone: body.phone,
      email: body.email,
      managerName: body.managerName,
      squareFootage: body.squareFootage,
      isActive: body.isActive,
    },
  })
  return NextResponse.json(store)
}
