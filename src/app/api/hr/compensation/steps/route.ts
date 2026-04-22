import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const step = await prisma.compensationStep.create({
    data: {
      gradeId: body.gradeId,
      stepNo: body.stepNo,
      amount: body.amount,
    },
  })
  return NextResponse.json(step, { status: 201 })
}
