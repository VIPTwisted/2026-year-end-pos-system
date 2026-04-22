import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(_req: NextRequest) {
  try {
    const shipments = await prisma.salesShipment.findMany({
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(shipments)
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const shipment = await prisma.salesShipment.create({
      data: {
        ...body,
        postingDate: body.postingDate ? new Date(body.postingDate) : new Date(),
        shipmentNo: body.shipmentNo ?? `SS-${Date.now()}`,
      },
    })
    return NextResponse.json(shipment, { status: 201 })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
