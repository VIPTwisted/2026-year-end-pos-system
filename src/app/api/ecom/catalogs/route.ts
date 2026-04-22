import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status')
  const catalogs = await prisma.ecomCatalog.findMany({
    where: status ? { status } : undefined,
    include: {
      _count: { select: { categories: true, products: true } },
    },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(catalogs)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const catalog = await prisma.ecomCatalog.create({
    data: {
      name: body.name,
      channelId: body.channelId ?? null,
      channelName: body.channelName ?? null,
      status: body.status ?? 'draft',
    },
  })
  return NextResponse.json(catalog, { status: 201 })
}
