import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const where = status && status !== 'all' ? { status } : {}
    const sequences = await prisma.salesSequence.findMany({
      where,
      include: { steps: { orderBy: { stepNumber: 'asc' } } },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(sequences)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch sequences' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const sequence = await prisma.salesSequence.create({
      data: body,
      include: { steps: true },
    })
    return NextResponse.json(sequence, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create sequence' }, { status: 500 })
  }
}
