import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const items = await prisma.recommendationListItem.findMany({
    where: { listId: id },
    orderBy: { rank: 'asc' },
  })
  return NextResponse.json(items)
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const item = await prisma.recommendationListItem.create({
    data: {
      listId: id,
      productId: body.productId ?? null,
      productName: body.productName ?? null,
      sku: body.sku ?? null,
      rank: body.rank,
      score: body.score ?? 0,
    },
  })
  return NextResponse.json(item, { status: 201 })
}
