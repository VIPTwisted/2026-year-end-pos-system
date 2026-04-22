import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const zone = req.nextUrl.searchParams.get('zone')
  const items = await prisma.siteNavItem.findMany({
    where: zone ? { navZone: zone } : undefined,
    include: { children: true, page: true },
    orderBy: { sortOrder: 'asc' },
  })
  return NextResponse.json(items)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const item = await prisma.siteNavItem.create({ data: body })
  return NextResponse.json(item, { status: 201 })
}
