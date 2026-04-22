import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const data = await prisma.vpVendorPerformance.findMany({
    where: { vendorId: id },
    orderBy: { period: 'desc' },
  })
  return NextResponse.json(data)
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await req.json()

  if (!body.period) {
    return NextResponse.json({ error: 'period is required' }, { status: 400 })
  }

  const perf = await prisma.vpVendorPerformance.create({
    data: {
      vendorId:          id,
      period:            body.period,
      onTimeDeliveryPct: body.onTimeDeliveryPct ?? 0,
      qualityScore:      body.qualityScore ?? 0,
      fillRate:          body.fillRate ?? 0,
      avgLeadTimeDays:   body.avgLeadTimeDays ?? 0,
      totalOrders:       body.totalOrders ?? 0,
      totalSpend:        body.totalSpend ?? 0,
      defectRate:        body.defectRate ?? 0,
      notes:             body.notes ?? null,
    },
  })

  return NextResponse.json(perf, { status: 201 })
}
