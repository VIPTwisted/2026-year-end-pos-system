import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status')
  const carrierId = searchParams.get('carrierId')
  const shipmentType = searchParams.get('type')
  const mode = searchParams.get('mode')
  const take = searchParams.get('take')

  const shipments = await prisma.tmsShipment.findMany({
    where: {
      ...(status ? { status } : {}),
      ...(carrierId ? { carrierId } : {}),
      ...(shipmentType ? { shipmentType } : {}),
      ...(mode ? { mode } : {}),
    },
    include: {
      carrier: { select: { name: true, carrierCode: true } },
      lines: true,
    },
    orderBy: { createdAt: 'desc' },
    ...(take ? { take: parseInt(take) } : {}),
  })
  return NextResponse.json(shipments)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const shipment = await prisma.tmsShipment.create({
    data: {
      carrierId: body.carrierId ?? null,
      loadId: body.loadId ?? null,
      status: body.status ?? 'pending',
      shipmentType: body.shipmentType ?? 'outbound',
      mode: body.mode ?? 'road',
      origin: body.origin || null,
      originCity: body.originCity,
      originState: body.originState,
      destination: body.destination || null,
      destCity: body.destCity,
      destState: body.destState,
      requestedDate: body.requestedDate ? new Date(body.requestedDate) : null,
      scheduledDate: body.scheduledDate ? new Date(body.scheduledDate) : null,
      estimatedDays: body.estimatedDays ?? null,
      trackingNumber: body.trackingNumber || null,
      serviceLevel: body.serviceLevel ?? 'standard',
      freightTerms: body.freightTerms ?? 'prepaid',
      weight: body.weight ?? null,
      pieces: body.pieces ?? null,
      volume: body.volume ?? null,
      freightCharge: body.freightCharge ?? null,
      fuelSurcharge: body.fuelSurcharge ?? null,
      accessorials: body.accessorials ?? null,
      totalCharge: body.totalCharge ?? null,
      currency: body.currency ?? 'USD',
      soNumber: body.soNumber || null,
      poNumber: body.poNumber || null,
      notes: body.notes || null,
    },
  })
  return NextResponse.json(shipment, { status: 201 })
}
