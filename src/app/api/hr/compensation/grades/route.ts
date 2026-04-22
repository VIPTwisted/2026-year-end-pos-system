import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const grade = await prisma.compensationGrade.create({
    data: {
      planId: body.planId,
      gradeCode: body.gradeCode,
      description: body.description ?? null,
      minAmount: body.minAmount ?? 0,
      midAmount: body.midAmount ?? 0,
      maxAmount: body.maxAmount ?? 0,
    },
  })
  return NextResponse.json(grade, { status: 201 })
}
