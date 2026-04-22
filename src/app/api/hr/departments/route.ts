import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const isActive = searchParams.get('isActive')

    const departments = await prisma.department.findMany({
      where: isActive !== null ? { isActive: isActive === 'true' } : undefined,
      orderBy: { deptName: 'asc' },
    })
    return NextResponse.json(departments)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch departments' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const dept = await prisma.department.create({ data: body })
    return NextResponse.json(dept, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create department' }, { status: 500 })
  }
}
