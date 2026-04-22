import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const scorecards = await prisma.vendorScorecard.findMany({
      where: { vendorId: id },
      orderBy: { period: 'desc' },
    })

    return NextResponse.json(scorecards)
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to fetch scorecards' }, { status: 500 })
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await req.json()

    const vendor = await prisma.vendor.findUnique({ where: { id } })
    if (!vendor) {
      return NextResponse.json({ error: 'Vendor not found' }, { status: 404 })
    }

    const scores: number[] = []
    if (body.onTimeScore !== undefined && body.onTimeScore !== null) scores.push(Number(body.onTimeScore))
    if (body.qualityScore !== undefined && body.qualityScore !== null) scores.push(Number(body.qualityScore))
    if (body.fillRateScore !== undefined && body.fillRateScore !== null) scores.push(Number(body.fillRateScore))

    const overallScore = scores.length > 0
      ? scores.reduce((a, b) => a + b, 0) / scores.length
      : null

    const scorecard = await prisma.vendorScorecard.create({
      data: {
        vendorId: id,
        period: body.period,
        onTimeScore: body.onTimeScore !== undefined ? Number(body.onTimeScore) : null,
        qualityScore: body.qualityScore !== undefined ? Number(body.qualityScore) : null,
        fillRateScore: body.fillRateScore !== undefined ? Number(body.fillRateScore) : null,
        overallScore,
        notes: body.notes || null,
      },
    })

    // Update vendor rating with avg of all scorecards
    const allScorecards = await prisma.vendorScorecard.findMany({
      where: { vendorId: id, overallScore: { not: null } },
      select: { overallScore: true },
    })

    if (allScorecards.length > 0) {
      const avgRating =
        allScorecards.reduce((sum, s) => sum + (s.overallScore ?? 0), 0) /
        allScorecards.length

      // Convert 0-100 scale to 1-5
      const rating = 1 + (avgRating / 100) * 4

      await prisma.vendor.update({
        where: { id },
        data: { rating: Math.round(rating * 10) / 10 },
      })
    }

    return NextResponse.json(scorecard, { status: 201 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to create scorecard' }, { status: 500 })
  }
}
