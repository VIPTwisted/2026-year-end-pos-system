import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const mode = searchParams.get('mode')
  const active = searchParams.get('active')
  const preferred = searchParams.get('preferred')

  const carriers = await prisma.tmsCarrier.findMany({
    where: {
      ...(mode ? { mode } : {}),
      ...(active === 'true' ? { isActive: true } : {}),
      ...(preferred === 'true' ? { isPreferred: true } : {}),
    },
    orderBy: { name: 'asc' },
  })
  return NextResponse.json(carriers)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const carrier = await prisma.tmsCarrier.create({
    data: {
      carrierCode: body.carrierCode,
      name: body.name,
      scac: body.scac || null,
      dotNumber: body.dotNumber || null,
      mcNumber: body.mcNumber || null,
      carrierType: body.carrierType ?? 'truckload',
      mode: body.mode ?? 'road',
      contactName: body.contactName || null,
      contactPhone: body.contactPhone || null,
      contactEmail: body.contactEmail || null,
      address: body.address || null,
      city: body.city || null,
      state: body.state || null,
      zip: body.zip || null,
      country: body.country ?? 'US',
      isPreferred: body.isPreferred ?? false,
      isActive: body.isActive ?? true,
    },
  })
  return NextResponse.json(carrier, { status: 201 })
}
