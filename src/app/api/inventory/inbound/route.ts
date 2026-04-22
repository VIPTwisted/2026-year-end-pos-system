import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status')
  const shipments = await prisma.inboundShipment.findMany({
    where: status ? { status } : undefined,
    include: { lines: true, crossDockLines: true },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(shipments)
}

export async function POST(req: Request) {
  const body = await req.json()
  const num = `ASN-${Date.now().toString().slice(-6)}`
  const shipment = await prisma.inboundShipment.create({
    data: {
      shipmentNumber: num,
      vendorName: body.vendorName,
      poNumber: body.poNumber,
      expectedDate: body.expectedDate ? new Date(body.expectedDate) : null,
      locationName: body.locationName,
      lines: body.lines ? { create: body.lines } : undefined,
    },
    include: { lines: true },
  })
  return NextResponse.json(shipment, { status: 201 })
}
