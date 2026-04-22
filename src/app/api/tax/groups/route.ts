import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const groups = await prisma.taxGroup.findMany({
    include: { components: true },
    orderBy: { groupCode: 'asc' },
  })
  return NextResponse.json(groups)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const group = await prisma.taxGroup.create({
    data: {
      groupCode: body.groupCode,
      groupName: body.groupName,
      description: body.description ?? null,
      isActive: body.isActive ?? true,
    },
  })
  return NextResponse.json(group, { status: 201 })
}
