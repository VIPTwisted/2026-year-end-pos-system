import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const assortment = await prisma.assortment.findUnique({
    where: { id },
    include: { lines: true, channels: true },
  })
  if (!assortment) return NextResponse.json({ error: 'not found' }, { status: 404 })
  return NextResponse.json(assortment)
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const { name, description, startDate, endDate, status, lines, channels } = body

  const assortment = await prisma.assortment.update({
    where: { id },
    data: {
      ...(name !== undefined && { name }),
      ...(description !== undefined && { description }),
      ...(status !== undefined && { status }),
      ...(startDate !== undefined && { startDate: startDate ? new Date(startDate) : null }),
      ...(endDate !== undefined && { endDate: endDate ? new Date(endDate) : null }),
    },
  })

  if (Array.isArray(lines)) {
    await prisma.assortmentLine.deleteMany({ where: { assortmentId: id } })
    if (lines.length > 0) {
      await prisma.assortmentLine.createMany({
        data: lines.map((l: { productId?: string; categoryId?: string; lineType?: string }) => ({
          assortmentId: id,
          productId: l.productId,
          categoryId: l.categoryId,
          lineType: l.lineType ?? 'product',
        })),
      })
    }
  }

  if (Array.isArray(channels)) {
    await prisma.assortmentChannel.deleteMany({ where: { assortmentId: id } })
    if (channels.length > 0) {
      await prisma.assortmentChannel.createMany({
        data: channels.map((c: string) => ({ assortmentId: id, channelId: c })),
        skipDuplicates: true,
      })
    }
  }

  const result = await prisma.assortment.findUnique({
    where: { id },
    include: { lines: true, channels: true },
  })
  return NextResponse.json(result)
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await prisma.assortment.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
