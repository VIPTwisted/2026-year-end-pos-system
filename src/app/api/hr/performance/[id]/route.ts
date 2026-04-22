import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const review = await prisma.performanceReview.findUnique({ where: { id } })
    if (!review) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(review)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch review' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await req.json()
    const review = await prisma.performanceReview.update({ where: { id }, data: body })
    return NextResponse.json(review)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update review' }, { status: 500 })
  }
}
