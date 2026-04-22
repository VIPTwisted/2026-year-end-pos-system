import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const status = req.nextUrl.searchParams.get('status')
  const assortments = await prisma.assortment.findMany({
    where: status ? { status } : undefined,
    include: { lines: true, channels: true },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(assortments)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { name, description, startDate, endDate, lines, channels } = body
  if (!name) return NextResponse.json({ error: 'name required' }, { status: 400 })

  const assortment = await prisma.assortment.create({
    data: {
      name,
      description,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      lines: lines?.length
        ? { create: lines.map((l: { productId?: string; categoryId?: string; lineType?: string }) => ({
            productId: l.productId,
            categoryId: l.categoryId,
            lineType: l.lineType ?? 'product',
          })) }
        : undefined,
      channels: channels?.length
        ? { create: channels.map((c: string) => ({ channelId: c })) }
        : undefined,
    },
    include: { lines: true, channels: true },
  })
  return NextResponse.json(assortment, { status: 201 })
}
