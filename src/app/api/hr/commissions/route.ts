import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const sp = req.nextUrl.searchParams
    const employeeId = sp.get('employeeId') ?? undefined
    const period = sp.get('period') ?? undefined
    const status = sp.get('status') ?? undefined

    const commissions = await prisma.commission.findMany({
      where: {
        ...(employeeId ? { employeeId } : {}),
        ...(period ? { period } : {}),
        ...(status ? { status } : {}),
      },
      include: {
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            position: true,
          },
        },
        order: {
          select: {
            id: true,
            orderNumber: true,
            createdAt: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(commissions)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      employeeId: string
      orderId: string
      rate: number
      saleAmount: number
      notes?: string
    }

    const { employeeId, orderId, rate, saleAmount, notes } = body

    if (!employeeId || !orderId || rate === undefined || saleAmount === undefined) {
      return NextResponse.json({ error: 'employeeId, orderId, rate, and saleAmount are required' }, { status: 400 })
    }

    const order = await prisma.order.findUnique({ where: { id: orderId } })
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    const employee = await prisma.employee.findUnique({ where: { id: employeeId } })
    if (!employee) {
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 })
    }

    const amount = saleAmount * rate
    const period = order.createdAt.toISOString().slice(0, 7) // YYYY-MM

    const commission = await prisma.commission.create({
      data: {
        employeeId,
        orderId,
        rate,
        saleAmount,
        amount,
        period,
        status: 'pending',
        ...(notes ? { notes } : {}),
      },
      include: {
        employee: {
          select: { id: true, firstName: true, lastName: true, position: true },
        },
        order: {
          select: { id: true, orderNumber: true, createdAt: true },
        },
      },
    })

    return NextResponse.json(commission, { status: 201 })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
