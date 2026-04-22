import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const series = await prisma.numberSeries.findUnique({
    where: { id },
    include: {
      usageLogs: { orderBy: { createdAt: 'desc' }, take: 20 },
    },
  })
  if (!series) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(series)
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await req.json()
  const {
    description, prefix, suffix,
    startingNo, incrementBy, endingNo, paddingLength,
    isDefault, allowManual,
  } = body

  const existing = await prisma.numberSeries.findUnique({ where: { id } })
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const series = await prisma.numberSeries.update({
    where: { id },
    data: {
      ...(description !== undefined ? { description } : {}),
      ...(prefix !== undefined ? { prefix } : {}),
      ...(suffix !== undefined ? { suffix } : {}),
      ...(startingNo !== undefined ? { startingNo } : {}),
      ...(incrementBy !== undefined ? { incrementBy } : {}),
      ...(endingNo !== undefined ? { endingNo } : {}),
      ...(paddingLength !== undefined ? { paddingLength } : {}),
      ...(isDefault !== undefined ? { isDefault } : {}),
      ...(allowManual !== undefined ? { allowManual } : {}),
    },
  })
  return NextResponse.json(series)
}
