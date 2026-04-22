import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const regions = await prisma.taxRegion.findMany({
    include: { codes: true },
    orderBy: [{ country: 'asc' }, { name: 'asc' }],
  })
  return NextResponse.json(regions)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { name, country, stateProvince, taxType, standardRate, reducedRate, zeroRate } = body
  if (!name || !country) {
    return NextResponse.json({ error: 'name and country required' }, { status: 400 })
  }
  const region = await prisma.taxRegion.create({
    data: {
      name,
      country,
      stateProvince: stateProvince ?? null,
      taxType: taxType ?? 'vat',
      standardRate: parseFloat(standardRate ?? 0),
      reducedRate: reducedRate !== undefined ? parseFloat(reducedRate) : null,
      zeroRate: parseFloat(zeroRate ?? 0),
      isActive: true,
    },
  })
  return NextResponse.json(region, { status: 201 })
}
