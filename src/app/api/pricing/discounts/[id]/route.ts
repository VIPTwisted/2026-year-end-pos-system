import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const discount = await prisma.discount.findUnique({
    where: { id },
    include: {
      priceGroup: true,
      lines: true,
      usages: { orderBy: { usedAt: 'desc' }, take: 100 },
    },
  })
  if (!discount) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(discount)
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const { lines, ...discountData } = body

  const discount = await prisma.discount.update({
    where: { id },
    data: {
      ...discountData,
      ...(lines !== undefined
        ? {
            lines: {
              deleteMany: {},
              create: lines,
            },
          }
        : {}),
    },
    include: { lines: true, priceGroup: true },
  })
  return NextResponse.json(discount)
}
