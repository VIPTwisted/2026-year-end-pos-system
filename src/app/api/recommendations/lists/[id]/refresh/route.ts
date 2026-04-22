import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const list = await prisma.recommendationList.update({
    where: { id },
    data: { lastRefreshedAt: new Date() },
    include: { items: { orderBy: { rank: 'asc' } } },
  })
  return NextResponse.json(list)
}
