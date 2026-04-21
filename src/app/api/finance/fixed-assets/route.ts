import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const assets = await prisma.fixedAsset.findMany({
    include: { group: true },
    orderBy: { assetNumber: 'asc' },
  })
  return NextResponse.json(assets)
}

export async function POST(req: NextRequest) {
  const body = await req.json()

  if (!body.name) {
    return NextResponse.json({ error: 'name is required' }, { status: 400 })
  }
  if (!body.groupId) {
    return NextResponse.json({ error: 'groupId is required' }, { status: 400 })
  }
  if (!body.acquisitionDate) {
    return NextResponse.json({ error: 'acquisitionDate is required' }, { status: 400 })
  }
  if (typeof body.acquisitionCost !== 'number' || body.acquisitionCost <= 0) {
    return NextResponse.json({ error: 'acquisitionCost must be a positive number' }, { status: 400 })
  }
  if (typeof body.usefulLifeYears !== 'number' || body.usefulLifeYears <= 0) {
    return NextResponse.json({ error: 'usefulLifeYears must be a positive number' }, { status: 400 })
  }

  const acquisitionCost: number = body.acquisitionCost
  const salvageValue: number = typeof body.salvageValue === 'number' ? body.salvageValue : 0
  const currentBookValue = acquisitionCost - salvageValue

  // Auto-generate assetNumber if not provided
  const assetNumber: string = body.assetNumber?.trim() || `FA-${Date.now().toString(36).toUpperCase()}`

  // Check uniqueness
  const existing = await prisma.fixedAsset.findUnique({ where: { assetNumber } })
  if (existing) {
    return NextResponse.json(
      { error: `Asset number "${assetNumber}" is already in use` },
      { status: 409 }
    )
  }

  const asset = await prisma.fixedAsset.create({
    data: {
      assetNumber,
      name: body.name.trim(),
      description: body.description ?? null,
      groupId: body.groupId,
      acquisitionDate: new Date(body.acquisitionDate),
      acquisitionCost,
      salvageValue,
      usefulLifeYears: body.usefulLifeYears,
      depreciationMethod: body.depreciationMethod ?? 'straight_line',
      currentBookValue,
      accumulatedDeprec: 0,
      status: 'active',
      location: body.location ?? null,
      serialNumber: body.serialNumber ?? null,
      notes: body.notes ?? null,
    },
    include: { group: true },
  })

  return NextResponse.json(asset, { status: 201 })
}
