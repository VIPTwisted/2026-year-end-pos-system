import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const carrierId = searchParams.get('carrierId')
  const active = searchParams.get('active')

  const routes = await prisma.tmsRoute.findMany({
    where: {
      ...(carrierId ? { carrierId } : {}),
      ...(active === 'true' ? { isActive: true } : {}),
    },
    include: { carrier: { select: { name: true, carrierCode: true } } },
    orderBy: { routeCode: 'asc' },
  })
  return NextResponse.json(routes)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const route = await prisma.tmsRoute.create({
    data: {
      routeCode: body.routeCode,
      name: body.name,
      carrierId: body.carrierId ?? null,
      originCity: body.originCity,
      originState: body.originState,
      destCity: body.destCity,
      destState: body.destState,
      transitDays: body.transitDays ?? 1,
      distance: body.distance ?? null,
      serviceLevel: body.serviceLevel ?? 'standard',
      ratePerMile: body.ratePerMile ?? null,
      flatRate: body.flatRate ?? null,
      fuelSurcharge: body.fuelSurcharge ?? null,
      isActive: body.isActive ?? true,
    },
  })
  return NextResponse.json(route, { status: 201 })
}
