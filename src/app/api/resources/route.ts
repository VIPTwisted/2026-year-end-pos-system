import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const type = searchParams.get('type')
  const active = searchParams.get('active')
  const search = searchParams.get('search')

  const where: Record<string, unknown> = {}
  if (type) where.type = type
  if (active !== null) where.isActive = active !== 'false'
  if (search) {
    where.OR = [
      { resourceNo: { contains: search } },
      { name: { contains: search } },
    ]
  }

  const resources = await prisma.resource.findMany({
    where,
    include: {
      skills: { orderBy: { skillName: 'asc' } },
      bookings: { orderBy: { startDate: 'asc' } },
    },
    orderBy: { name: 'asc' },
  })
  return NextResponse.json(resources)
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, type, unitCost } = body

    if (!name?.trim()) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }

    // Auto-number: RES-NNNN
    const last = await prisma.resource.findFirst({
      where: { resourceNo: { startsWith: 'RES-' } },
      orderBy: { resourceNo: 'desc' },
    })
    const seq = last?.resourceNo ? parseInt(last.resourceNo.slice(4)) + 1 : 1
    const resourceNo = `RES-${String(seq).padStart(4, '0')}`

    const resource = await prisma.resource.create({
      data: {
        resourceNo,
        name: name.trim(),
        type: type || 'labor',
        unitCost: unitCost ? parseFloat(unitCost) : 0,
      },
    })
    return NextResponse.json(resource, { status: 201 })
  } catch (err: unknown) {
    console.error(err)
    return NextResponse.json({ error: 'Create failed' }, { status: 500 })
  }
}
