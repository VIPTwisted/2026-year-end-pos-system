import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const employeeName = searchParams.get('employeeName')
  const status = searchParams.get('status')
  const courseId = searchParams.get('courseId')

  const enrollments = await prisma.trainingEnrollment.findMany({
    where: {
      ...(employeeName ? { employeeName: { contains: employeeName } } : {}),
      ...(status ? { status } : {}),
      ...(courseId ? { courseId } : {}),
    },
    include: { course: { select: { name: true, category: true } } },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(enrollments)
}
