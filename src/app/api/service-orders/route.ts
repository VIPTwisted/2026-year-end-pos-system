import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

function genOrderNo(): string {
  const year = new Date().getFullYear()
  const seq = String(Math.floor(Math.random() * 9000) + 1000).padStart(4, '0')
  return `SO-${year}${seq}`
}

export async function GET(req: NextRequest) {
  try {
    const sp = req.nextUrl.searchParams
    const status = sp.get('status')
    const customerId = sp.get('customerId')

    const where: Record<string, unknown> = {}
    if (status) where.status = status
    if (customerId) where.customerId = customerId

    const orders = await prisma.serviceOrder.findMany({
      where,
      include: {
        customer: { select: { id: true, firstName: true, lastName: true, email: true, phone: true } },
        technician: { select: { id: true, firstName: true, lastName: true, position: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(orders)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      customerId,
      technicianId,
      priority,
      deviceType,
      deviceSerial,
      issueReported,
      estimatedDays,
      depositPaid,
      notes,
    } = body

    if (!issueReported) {
      return NextResponse.json({ error: 'issueReported is required' }, { status: 400 })
    }

    // Generate unique order number (retry on collision)
    let orderNo = genOrderNo()
    let attempts = 0
    while (attempts < 5) {
      const existing = await prisma.serviceOrder.findUnique({ where: { orderNo } })
      if (!existing) break
      orderNo = genOrderNo()
      attempts++
    }

    const order = await prisma.serviceOrder.create({
      data: {
        orderNo,
        customerId: customerId || null,
        technicianId: technicianId || null,
        priority: priority ?? 'normal',
        deviceType: deviceType || null,
        deviceSerial: deviceSerial || null,
        issueReported,
        estimatedDays: estimatedDays ? parseInt(estimatedDays) : null,
        depositPaid: depositPaid ? parseFloat(depositPaid) : 0,
        notes: notes || null,
        status: 'intake',
      },
      include: {
        customer: { select: { id: true, firstName: true, lastName: true } },
        technician: { select: { id: true, firstName: true, lastName: true } },
      },
    })

    return NextResponse.json(order, { status: 201 })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
