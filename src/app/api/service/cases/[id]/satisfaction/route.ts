import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await req.json()
  const { rating, comment } = body

  if (!rating || rating < 1 || rating > 5) {
    return NextResponse.json({ error: 'rating must be 1-5' }, { status: 400 })
  }

  const existing = await prisma.serviceCase2.findUnique({ where: { id } })
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  // Upsert satisfaction
  const satisfaction = await prisma.caseSatisfaction.upsert({
    where: { caseId: id },
    update: { rating: Number(rating), comment: comment ?? null },
    create: {
      caseId:  id,
      rating:  Number(rating),
      comment: comment ?? null,
    },
  })

  return NextResponse.json(satisfaction, { status: 201 })
}
