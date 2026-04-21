import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const locationId = searchParams.get('locationId')

  if (!locationId) {
    return NextResponse.json({ error: 'locationId query param is required' }, { status: 400 })
  }

  // Resolve locationCode from id
  const location = await prisma.wmsLocation.findUnique({
    where: { id: locationId },
    select: { locationCode: true },
  })

  if (!location) {
    return NextResponse.json({ error: 'Location not found' }, { status: 404 })
  }

  const bins = await prisma.wmsBin.findMany({
    where: { locationCode: location.locationCode },
    orderBy: [{ zoneCode: 'asc' }, { binCode: 'asc' }],
    select: {
      id: true,
      locationCode: true,
      zoneCode: true,
      rackCode: true,
      binCode: true,
      binType: true,
      isBlocked: true,
    },
  })

  return NextResponse.json(bins)
}
