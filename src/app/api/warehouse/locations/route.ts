import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const locations = await prisma.wmsLocation.findMany({
    include: {
      zones: {
        include: {
          racks: {
            include: {
              bins: {
                include: { contents: true },
              },
            },
          },
        },
      },
    },
    orderBy: { locationCode: 'asc' },
  })

  const result = locations.map(loc => {
    const zoneCount = loc.zones.length
    const binCount = loc.zones.reduce(
      (sum, z) => sum + z.racks.reduce((s2, r) => s2 + r.bins.length, 0),
      0
    )
    const contentCount = loc.zones.reduce(
      (sum, z) =>
        sum +
        z.racks.reduce(
          (s2, r) => s2 + r.bins.reduce((s3, b) => s3 + b.contents.length, 0),
          0
        ),
      0
    )
    return {
      id: loc.id,
      locationCode: loc.locationCode,
      name: loc.name,
      city: loc.city,
      state: loc.state,
      isActive: loc.isActive,
      requireReceive: loc.requireReceive,
      requireShipment: loc.requireShipment,
      requirePick: loc.requirePick,
      requirePutaway: loc.requirePutaway,
      binMandatory: loc.binMandatory,
      isCrossDock: loc.isCrossDock,
      zoneCount,
      binCount,
      contentCount,
    }
  })

  return NextResponse.json(result)
}
