import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const status = req.nextUrl.searchParams.get('status')
  const enrollments = await prisma.callCenterContinuity.findMany({
    where: status ? { status } : {},
    include: { order: { select: { orderNumber: true } } },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(enrollments)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const enrollment = await prisma.callCenterContinuity.create({ data: body })
  return NextResponse.json(enrollment, { status: 201 })
}
