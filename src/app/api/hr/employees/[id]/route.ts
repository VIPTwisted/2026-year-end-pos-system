import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

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
      shifts: { include: { store: true }, orderBy: { startTime: 'desc' }, take: 10 },
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

  type UpdateFields = {
    position?: string
    department?: string | null
    hourlyRate?: number | null
    isActive?: boolean
    firstName?: string
    lastName?: string
  }

  const updatable = ['position', 'department', 'hourlyRate', 'isActive', 'firstName', 'lastName'] as const
  const data: UpdateFields = {}
  for (const field of updatable) {
    if (field in body) (data as Record<string, unknown>)[field] = body[field]
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: 'No updatable fields provided' }, { status: 400 })
  }

  try {
    const employee = await prisma.employee.update({
      where: { id },
      data,
      include: { user: true, store: true },
    })
    return NextResponse.json(employee)
  } catch (err) {
    console.error('[PATCH /api/hr/employees/:id]', err)
    return NextResponse.json({ error: 'Failed to update employee', detail: String(err) }, { status: 500 })
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const existing = await prisma.employee.findUnique({ where: { id } })
  if (!existing) {
    return NextResponse.json({ error: 'Employee not found' }, { status: 404 })
  }

  try {
    // Soft delete — set inactive
    const employee = await prisma.employee.update({
      where: { id },
      data: { isActive: false },
    })
    return NextResponse.json({ ok: true, employee })
  } catch (err) {
    console.error('[DELETE /api/hr/employees/:id]', err)
    return NextResponse.json({ error: 'Failed to delete employee', detail: String(err) }, { status: 500 })
  }
}
