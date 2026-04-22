import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const skills = await prisma.employeeSkill.findMany({
    where: { employeeId: id },
    include: { skill: true },
    orderBy: { createdAt: 'asc' },
  })
  return NextResponse.json(skills)
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const empSkill = await prisma.employeeSkill.create({
    data: {
      employeeId: id,
      skillId: body.skillId,
      level: body.level ?? 'beginner',
      yearsExp: body.yearsExp ?? 0,
      certifiedDate: body.certifiedDate ? new Date(body.certifiedDate) : null,
      expiryDate: body.expiryDate ? new Date(body.expiryDate) : null,
      notes: body.notes ?? null,
    },
    include: { skill: true },
  })
  return NextResponse.json(empSkill, { status: 201 })
}
