import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const where: Record<string, unknown> = {}
  const overrideType = searchParams.get('overrideType'); if (overrideType) where.overrideType = overrideType
  const storeId = searchParams.get('storeId'); if (storeId) where.storeId = storeId
  const from = searchParams.get('from'); const to = searchParams.get('to')
  if (from || to) where.createdAt = { ...(from ? { gte: new Date(from) } : {}), ...(to ? { lte: new Date(to) } : {}) }
  return NextResponse.json(await prisma.managerOverride.findMany({ where, orderBy: { createdAt: 'desc' } }))
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const override = await prisma.managerOverride.create({
    data: {
      overrideType: body.overrideType, requestedBy: body.requestedBy, approvedBy: body.approvedBy,
      storeId: body.storeId, registerId: body.registerId, originalValue: body.originalValue,
      overrideValue: body.overrideValue, reason: body.reason, status: body.status ?? 'approved',
    },
  })
  return NextResponse.json(override, { status: 201 })
}
