import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const csus = await prisma.commerceScaleUnit.findMany({
    include: { channelAssignments: true },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(csus)
}

export async function POST(req: Request) {
  const body = await req.json()
  const csu = await prisma.commerceScaleUnit.create({
    data: {
      csuName: body.csuName,
      csuType: body.csuType ?? 'cloud',
      region: body.region,
      endpointUrl: body.endpointUrl,
      version: body.version,
    },
  })
  return NextResponse.json(csu, { status: 201 })
}
