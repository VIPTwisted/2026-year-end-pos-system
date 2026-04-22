import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const workCenters = await prisma.workCenter.findMany({
    orderBy: [{ isActive: 'desc' }, { name: 'asc' }],
    include: { _count: { select: { routingLines: true } } },
  })
  return NextResponse.json(workCenters)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  if (!body.code?.trim() || !body.name?.trim()) {
    return NextResponse.json({ error: 'code and name are required' }, { status: 400 })
  }
  const wc = await prisma.workCenter.create({
    data: {
      code: body.code.trim().toUpperCase(),
      name: body.name.trim(),
      description: body.description?.trim() || null,
      capacity: Number(body.capacity ?? 1),
      unitOfMeasure: body.unitOfMeasure?.trim() || 'hours',
      costPerHour: Number(body.costPerHour ?? 0),
      efficiency: Number(body.efficiency ?? 100),
      isActive: body.isActive !== false,
    },
  })
  return NextResponse.json(wc, { status: 201 })
}
