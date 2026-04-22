import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: benefitId } = await params
    const body = await req.json()
    const enrollment = await prisma.hRBenefitEnrollment.create({
      data: { ...body, benefitId },
    })
    return NextResponse.json(enrollment, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create enrollment' }, { status: 500 })
  }
}
