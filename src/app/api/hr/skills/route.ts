import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const employeeId = searchParams.get('employeeId')
    const type = searchParams.get('type') // 'library' | 'employee'

    if (type === 'employee' || employeeId) {
      const employeeSkills = await prisma.hREmployeeSkill.findMany({
        where: employeeId ? { employeeId } : undefined,
        orderBy: { createdAt: 'desc' },
      })
      return NextResponse.json(employeeSkills)
    }

    const skills = await prisma.hRSkill.findMany({
      orderBy: { skillName: 'asc' },
    })
    return NextResponse.json(skills)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch skills' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { type, ...data } = body

    if (type === 'employee') {
      const employeeSkill = await prisma.hREmployeeSkill.create({ data })
      return NextResponse.json(employeeSkill, { status: 201 })
    }

    const skill = await prisma.hRSkill.create({ data })
    return NextResponse.json(skill, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create skill' }, { status: 500 })
  }
}
