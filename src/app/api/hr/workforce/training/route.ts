import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const category = searchParams.get('category')

  const courses = await prisma.trainingCourse.findMany({
    where: { ...(category ? { category } : {}) },
    include: { _count: { select: { enrollments: true } } },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(courses)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { name, category, description, duration, format, isRequired, expiresInDays, contentUrl } = body
  const course = await prisma.trainingCourse.create({
    data: {
      name, category: category ?? 'compliance', description,
      duration: duration ?? 60, format: format ?? 'online',
      isRequired: isRequired ?? false, expiresInDays, contentUrl,
    },
  })
  return NextResponse.json(course, { status: 201 })
}
