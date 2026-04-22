import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: caseId } = await params
  const survey = await prisma.caseSurvey.findUnique({ where: { caseId } })
  if (!survey) return NextResponse.json(null)
  return NextResponse.json(survey)
}

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: caseId } = await params
  const existing = await prisma.caseSurvey.findUnique({ where: { caseId } })
  if (existing) return NextResponse.json(existing)

  const survey = await prisma.caseSurvey.create({
    data: { caseId, sentAt: new Date() },
  })
  return NextResponse.json(survey, { status: 201 })
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: caseId } = await params
  const { rating, nps, comment } = await req.json()

  const survey = await prisma.caseSurvey.upsert({
    where: { caseId },
    update: {
      rating: rating !== undefined ? parseInt(rating) : undefined,
      nps: nps !== undefined ? parseInt(nps) : undefined,
      comment: comment ?? undefined,
      respondedAt: new Date(),
    },
    create: {
      caseId,
      sentAt: new Date(),
      respondedAt: new Date(),
      rating: rating ? parseInt(rating) : null,
      nps: nps ? parseInt(nps) : null,
      comment: comment ?? null,
    },
  })
  return NextResponse.json(survey)
}
