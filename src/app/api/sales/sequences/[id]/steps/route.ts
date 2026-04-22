import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const steps = await prisma.salesSequenceStep.findMany({
      where: { sequenceId: id },
      orderBy: { stepNumber: 'asc' },
    })
    return NextResponse.json(steps)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch steps' }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()
    const step = await prisma.salesSequenceStep.create({
      data: { ...body, sequenceId: id },
    })
    return NextResponse.json(step, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create step' }, { status: 500 })
  }
}
