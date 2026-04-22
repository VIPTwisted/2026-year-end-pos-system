import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status')
  const carrierId = searchParams.get('carrierId')

  const loads = await prisma.tmsLoad.findMany({
    where: {
      ...(status ? { status } : {}),
      ...(carrierId ? { carrierId } : {}),
    },
    include: {
      carrier: { select: { name: true, carrierCode: true } },
      _count: { select: { shipments: true } },
    },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(loads)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const load = await prisma.tmsLoad.create({
    data: {
      carrierId: body.carrierId ?? null,
      status: body.status ?? 'planning',
      loadType: body.loadType ?? 'FTL',
      originAddress: body.originAddress || null,
      originCity: body.originCity,
      originState: body.originState,
      destAddress: body.destAddress || null,
      destCity: body.destCity,
      destState: body.destState,
      pickupDate: body.pickupDate ? new Date(body.pickupDate) : null,
      deliveryDate: body.deliveryDate ? new Date(body.deliveryDate) : null,
      estimatedMiles: body.estimatedMiles ?? null,
      freightClass: body.freightClass || null,
      weight: body.weight ?? null,
      pieces: body.pieces ?? null,
      pallets: body.pallets ?? null,
      rateAmount: body.rateAmount ?? null,
      proNumber: body.proNumber || null,
      bolNumber: body.bolNumber || null,
      poNumbers: body.poNumbers || null,
      notes: body.notes || null,
    },
  })
  return NextResponse.json(load, { status: 201 })
}
