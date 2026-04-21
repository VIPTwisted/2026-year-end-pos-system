import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const employee = await prisma.employee.findUnique({
    where: { id },
    include: {
      user: true,
      store: true,
      shifts: {
        include: { store: true },
        orderBy: { startTime: 'desc' },
        take: 10,
      },
    },
  })

  if (!employee) {
    return NextResponse.json({ error: 'Employee not found' }, { status: 404 })
  }

  return NextResponse.json(employee)
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await req.json()

  const existing = await prisma.employee.findUnique({ where: { id } })
  if (!existing) {
    return NextResponse.json({ error: 'Employee not found' }, { status: 404 })
  }

  const updatable = ['position', 'department', 'hourlyRate', 'isActive'] as const

  type EmployeeUpdateFields = {
    position?: string
    department?: string
    hourlyRate?: number
    isActive?: boolean
  }

  const data: EmployeeUpdateFields = {}
  for (const field of updatable) {
    if (field in body) (data as Record<string, unknown>)[field] = body[field]
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: 'No updatable fields provided' }, { status: 400 })
  }

  const employee = await prisma.employee.update({
    where: { id },
    data,
    include: {
      user: true,
      store: true,
    },
  })

  return NextResponse.json(employee)
}
