import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const course = await prisma.trainingCourse.findUnique({
    where: { id },
    include: { enrollments: { orderBy: { createdAt: 'desc' } } },
  })
  if (!course) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(course)
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const course = await prisma.trainingCourse.update({
    where: { id },
    data: body,
  })
  return NextResponse.json(course)
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await prisma.trainingCourse.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
