import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const employees = await prisma.employee.findMany({
      include: {
        user: true,
        store: true,
        shifts: {
          orderBy: { startTime: 'desc' },
          take: 5,
        },
      },
      orderBy: { lastName: 'asc' },
    })

    return NextResponse.json(employees)
  } catch (err) {
    console.error('[GET /api/hr/employees]', err)
    return NextResponse.json(
      { error: 'Failed to fetch employees', detail: String(err) },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json()

  const {
    firstName,
    lastName,
    email,
    position,
    department,
    storeId,
    hireDate,
    hourlyRate,
  } = body as {
    firstName: string
    lastName: string
    email: string
    position: string
    department?: string
    storeId: string
    hireDate?: string
    hourlyRate?: number
  }

  if (!firstName || !lastName || !email || !position || !storeId) {
    return NextResponse.json(
      { error: 'firstName, lastName, email, position, and storeId are required' },
      { status: 400 }
    )
  }

  // Check if email already exists
  const existingUser = await prisma.user.findUnique({ where: { email } })
  if (existingUser) {
    return NextResponse.json({ error: 'A user with that email already exists' }, { status: 409 })
  }

  // Static bcrypt hash of "Welcome1!" (cost 10) — avoids importing bcrypt on the server edge
  const WELCOME_HASH =
    '$2b$10$XFE/qOhg.V8K8CrN8HF3VOhBbVGWLzqvEcjNi4uFlPlLbRiHFNSyq'

  try {
    const result = await prisma.$transaction(async tx => {
      const user = await tx.user.create({
        data: {
          email,
          name: `${firstName} ${lastName}`,
          role: 'employee',
          passwordHash: WELCOME_HASH,
          isActive: true,
        },
      })

      const employee = await tx.employee.create({
        data: {
          userId: user.id,
          storeId,
          firstName,
          lastName,
          position,
          department: department ?? null,
          hireDate: hireDate ? new Date(hireDate) : new Date(),
          hourlyRate: hourlyRate ?? null,
          isActive: true,
        },
        include: {
          user: true,
          store: true,
        },
      })

      return employee
    })

    return NextResponse.json(result, { status: 201 })
  } catch (err) {
    console.error('[POST /api/hr/employees]', err)
    return NextResponse.json(
      { error: 'Failed to create employee', detail: String(err) },
      { status: 500 }
    )
  }
}
