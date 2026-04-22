import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const sp = req.nextUrl.searchParams
    const employeeId = sp.get('employeeId') ?? undefined

    const rates = await prisma.commissionRate.findMany({
      where: {
        ...(employeeId ? { employeeId } : {}),
      },
      include: {
        employee: {
          select: { id: true, firstName: true, lastName: true, position: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(rates)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      employeeId?: string
      role?: string
      rate: number
      productCategory?: string
    }

    const { employeeId, role, rate, productCategory } = body

    if (rate === undefined || rate === null) {
      return NextResponse.json({ error: 'rate is required' }, { status: 400 })
    }

    if (rate <= 0 || rate > 1) {
      return NextResponse.json({ error: 'rate must be between 0 and 1 (e.g. 0.05 for 5%)' }, { status: 400 })
    }

    if (employeeId) {
      const employee = await prisma.employee.findUnique({ where: { id: employeeId } })
      if (!employee) {
        return NextResponse.json({ error: 'Employee not found' }, { status: 404 })
      }
    }

    const commissionRate = await prisma.commissionRate.create({
      data: {
        rate,
        ...(employeeId ? { employeeId } : {}),
        ...(role ? { role } : {}),
        ...(productCategory ? { productCategory } : {}),
        isActive: true,
      },
      include: {
        employee: {
          select: { id: true, firstName: true, lastName: true, position: true },
        },
      },
    })

    return NextResponse.json(commissionRate, { status: 201 })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
