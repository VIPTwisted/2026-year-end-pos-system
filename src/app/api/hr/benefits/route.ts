import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const isActive = searchParams.get('isActive')

    const benefits = await prisma.hRBenefit.findMany({
      where: isActive !== null ? { isActive: isActive === 'true' } : undefined,
      include: { enrollments: true },
      orderBy: { planName: 'asc' },
    })
    return NextResponse.json(benefits)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch benefits' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const benefit = await prisma.hRBenefit.create({ data: body })
    return NextResponse.json(benefit, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create benefit' }, { status: 500 })
  }
}
