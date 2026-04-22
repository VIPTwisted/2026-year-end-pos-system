import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  const units = await prisma.orgUnit.findMany({
    orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
  })
  return NextResponse.json(units)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { name, unitType, code, parentId, managerId, description, sortOrder } = body

  const unit = await prisma.orgUnit.create({
    data: {
      name,
      unitType: unitType ?? 'department',
      code,
      parentId: parentId || null,
      managerId: managerId || null,
      description: description || null,
      sortOrder: sortOrder ?? 0,
    },
  })
  return NextResponse.json(unit, { status: 201 })
}
