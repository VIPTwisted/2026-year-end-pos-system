import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const sp = req.nextUrl.searchParams
    const employeeId = sp.get('employeeId')

    const shifts = await prisma.shift.findMany({
      where: employeeId ? { employeeId } : undefined,
      include: {
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            position: true,
            department: true,
          },
        },
        store: {
          select: { id: true, name: true },
        },
      },
      orderBy: { startTime: 'desc' },
      take: 200,
    })

    return NextResponse.json(shifts)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      employeeId: string
      date: string
      checkIn: string
      checkOut?: string
      hoursWorked?: number
      notes?: string
    }

    const { employeeId, date, checkIn, checkOut, notes } = body

    if (!employeeId || !date || !checkIn) {
      return NextResponse.json(
        { error: 'employeeId, date, and checkIn are required' },
        { status: 400 },
      )
    }

    // Fetch employee to get storeId
    const employee = await prisma.employee.findUnique({
      where: { id: employeeId },
      select: { storeId: true },
    })

    if (!employee) {
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 })
    }

    // Combine date + time into full DateTime
    const startTime = new Date(`${date}T${checkIn}`)
    const endTime = checkOut ? new Date(`${date}T${checkOut}`) : undefined

    const shift = await prisma.shift.create({
      data: {
        employeeId,
        storeId: employee.storeId,
        startTime,
        endTime: endTime ?? startTime, // endTime is required by schema; use startTime as placeholder if not checked out
        status: endTime ? 'completed' : 'in_progress',
        notes: notes ?? null,
      },
      include: {
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            position: true,
            department: true,
          },
        },
      },
    })

    return NextResponse.json(shift, { status: 201 })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
