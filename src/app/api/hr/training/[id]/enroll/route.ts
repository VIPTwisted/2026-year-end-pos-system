import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const { employeeName, employeeId } = body

  const course = await prisma.trainingCourse.findUnique({ where: { id } })
  if (!course) return NextResponse.json({ error: 'Course not found' }, { status: 404 })

  let expiresAt: Date | undefined
  if (course.expiresInDays) {
    expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + course.expiresInDays)
  }

  const enrollment = await prisma.trainingEnrollment.create({
    data: {
      courseId: id,
      employeeName,
      employeeId,
      status: 'enrolled',
      progress: 0,
      expiresAt,
    },
  })
  return NextResponse.json(enrollment, { status: 201 })
}
