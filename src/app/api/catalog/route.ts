import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const catalogs = await prisma.ecomCatalog.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      _count: { select: { products: true, categories: true } },
    },
  })
  return NextResponse.json(catalogs)
}

export async function POST(req: Request) {
  const body = await req.json()
  const catalog = await prisma.ecomCatalog.create({
    data: {
      name: body.name,
      channelName: body.channelName ?? null,
    },
  })
  return NextResponse.json(catalog, { status: 201 })
}
