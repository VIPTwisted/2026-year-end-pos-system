import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const models = await (prisma as any).forecastModel.findMany({
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { entries: true } } },
    })
    return NextResponse.json(models)
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const model = await (prisma as any).forecastModel.create({
      data: {
        name: body.name,
        modelType: body.modelType ?? 'moving-average',
        horizon: Number(body.horizon ?? 12),
        periodType: body.periodType ?? 'monthly',
        smoothingAlpha: Number(body.smoothingAlpha ?? 0.3),
        seasonalPeriods: Number(body.seasonalPeriods ?? 12),
        isActive: body.isActive ?? true,
      },
    })
    return NextResponse.json(model, { status: 201 })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
