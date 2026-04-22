import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const catalog = await prisma.ecomCatalog.findUnique({
    where: { id },
    include: {
      categories: { orderBy: { position: 'asc' } },
      products: { orderBy: { createdAt: 'desc' } },
    },
  })
  if (!catalog) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(catalog)
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const catalog = await prisma.ecomCatalog.update({
    where: { id },
    data: {
      name: body.name,
      channelName: body.channelName,
      status: body.status,
    },
  })
  return NextResponse.json(catalog)
}
