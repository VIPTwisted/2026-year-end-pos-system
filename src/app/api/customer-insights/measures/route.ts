import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_: NextRequest) {
  const measures = await prisma.cIMeasure.findMany({
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(measures)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const measure = await prisma.cIMeasure.create({
    data: {
      measureName: body.measureName,
      description: body.description ?? null,
      measureType: body.measureType ?? 'customer',
      category: body.category ?? null,
      formulaJson: body.formulaJson ?? null,
      currentValue: body.currentValue ?? null,
      changePercent: body.changePercent ?? null,
      refreshSchedule: body.refreshSchedule ?? null,
      isActive: body.isActive ?? true,
    },
  })
  return NextResponse.json(measure, { status: 201 })
}
