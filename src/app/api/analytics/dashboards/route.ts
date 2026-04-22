import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const dashboards = await prisma.dashboard.findMany({
    include: { widgets: true },
    orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
  })
  return NextResponse.json(dashboards)
}

export async function POST(req: Request) {
  const body = await req.json()
  const dashboard = await prisma.dashboard.create({
    data: {
      name: body.name,
      isDefault: body.isDefault ?? false,
      layout: body.layout ?? '[]',
    },
    include: { widgets: true },
  })
  return NextResponse.json(dashboard, { status: 201 })
}
