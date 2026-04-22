import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await req.json().catch(() => ({}))
  const { usedBy, usedById } = body

  const series = await prisma.numberSeries.findUnique({ where: { id } })
  if (!series) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const nextNo = Math.max(series.lastNoUsed + series.incrementBy, series.startingNo)

  if (series.endingNo && nextNo > series.endingNo) {
    return NextResponse.json({ error: 'Number series exhausted' }, { status: 422 })
  }

  // Format the number with padding
  const padded = String(nextNo).padStart(series.paddingLength, '0')
  const formatted = [series.prefix, padded, series.suffix].filter(Boolean).join('')

  // Atomic update + log
  const [updated] = await prisma.$transaction([
    prisma.numberSeries.update({
      where: { id },
      data: { lastNoUsed: nextNo },
    }),
    prisma.numberSeriesLog.create({
      data: {
        seriesId: id,
        number: nextNo,
        numberGenerated: formatted,
        usedBy: usedBy ?? null,
        usedById: usedById ?? null,
      },
    }),
  ])

  return NextResponse.json({
    number: formatted,
    rawNo: nextNo,
    lastNoUsed: updated.lastNoUsed,
  })
}
