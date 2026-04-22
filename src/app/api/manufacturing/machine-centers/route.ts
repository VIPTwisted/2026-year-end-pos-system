import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const machineCenters = await prisma.machineCenter.findMany({
    orderBy: [{ isActive: 'desc' }, { name: 'asc' }],
    include: {
      workCenter: { select: { id: true, code: true, name: true } },
    },
  })
  return NextResponse.json(machineCenters)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  if (!body.code?.trim() || !body.name?.trim() || !body.workCenterId) {
    return NextResponse.json({ error: 'code, name, and workCenterId are required' }, { status: 400 })
  }

  const workCenter = await prisma.workCenter.findUnique({ where: { id: body.workCenterId } })
  if (!workCenter) {
    return NextResponse.json({ error: 'Work center not found' }, { status: 400 })
  }

  const mc = await prisma.machineCenter.create({
    data: {
      code: body.code.trim().toUpperCase(),
      name: body.name.trim(),
      workCenterId: body.workCenterId,
      capacity: Number(body.capacity ?? 1),
      costPerHour: Number(body.costPerHour ?? 0),
      isActive: body.isActive !== false,
    },
    include: {
      workCenter: { select: { id: true, code: true, name: true } },
    },
  })
  return NextResponse.json(mc, { status: 201 })
}
