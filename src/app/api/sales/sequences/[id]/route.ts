import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const sequence = await prisma.salesSequence.findUnique({
      where: { id },
      include: { steps: { orderBy: { stepNumber: 'asc' } } },
    })
    if (!sequence) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(sequence)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch sequence' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()
    const sequence = await prisma.salesSequence.update({
      where: { id },
      data: body,
      include: { steps: { orderBy: { stepNumber: 'asc' } } },
    })
    return NextResponse.json(sequence)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update sequence' }, { status: 500 })
  }
}
