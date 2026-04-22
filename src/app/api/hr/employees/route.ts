import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const q       = searchParams.get('q')?.toLowerCase() ?? ''
    const dept    = searchParams.get('department') ?? ''
    const status  = searchParams.get('status') ?? ''

    const employees = await prisma.employee.findMany({
      include: { user: true, store: true },
      orderBy: { lastName: 'asc' },
    })

    const filtered = employees.filter(e => {
      const fullName = `${e.firstName} ${e.lastName}`.toLowerCase()
      const matchQ     = !q || fullName.includes(q) || (e.user?.email ?? '').toLowerCase().includes(q)
      const matchDept  = !dept || (e.department ?? '') === dept
      const eStatus    = e.isActive ? 'Active' : 'Inactive'
      const matchStat  = !status || eStatus === status
      return matchQ && matchDept && matchStat
    })

    return NextResponse.json(filtered)
  } catch (err) {
    console.error('[GET /api/hr/employees]', err)
    return NextResponse.json({ error: 'Failed to fetch employees', detail: String(err) }, { status: 500 })
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

  const existingUser = await prisma.user.findUnique({ where: { email } })
  if (existingUser) {
    return NextResponse.json({ error: 'A user with that email already exists' }, { status: 409 })
  }

  // Static bcrypt hash of "Welcome1!" (cost 10)
  const WELCOME_HASH = '$2b$10$XFE/qOhg.V8K8CrN8HF3VOhBbVGWLzqvEcjNi4uFlPlLbRiHFNSyq'

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
        include: { user: true, store: true },
      })

      return employee
    })

    return NextResponse.json(result, { status: 201 })
  } catch (err) {
    console.error('[POST /api/hr/employees]', err)
    return NextResponse.json({ error: 'Failed to create employee', detail: String(err) }, { status: 500 })
  }
}
