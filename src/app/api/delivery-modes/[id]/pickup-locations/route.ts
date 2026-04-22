import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const locs = await prisma.pickupLocation.findMany({
    where: { deliveryModeId: id },
    include: { timeSlots: true },
  })
  return NextResponse.json(locs)
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const loc = await prisma.pickupLocation.create({
    data: {
      deliveryModeId: id,
      storeName: body.storeName,
      address: body.address,
      city: body.city,
      state: body.state,
      zipCode: body.zipCode,
      phone: body.phone,
    },
  })
  return NextResponse.json(loc, { status: 201 })
}
