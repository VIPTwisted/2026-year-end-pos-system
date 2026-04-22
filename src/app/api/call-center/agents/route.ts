import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const agents = await prisma.callCenterAgent.findMany({
    orderBy: { name: 'asc' },
    include: {
      _count: { select: { calls: true, orders: true } },
    },
  })
  return NextResponse.json(agents)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const agent = await prisma.callCenterAgent.create({
    data: {
      name: body.name,
      email: body.email,
      extension: body.extension || undefined,
      employeeId: body.employeeId || undefined,
      isActive: body.isActive ?? true,
    },
  })
  return NextResponse.json(agent, { status: 201 })
}
