import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

function generateOrderNumber() {
  const year = new Date().getFullYear()
  const seq = Date.now().toString(36).toUpperCase().slice(-6)
  return `SO-${year}-${seq}`
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status')
  const assignedTech = searchParams.get('assignedTech')
  const customerId = searchParams.get('customerId')
  const priority = searchParams.get('priority')

  const orders = await prisma.serviceOrder.findMany({
    where: {
      ...(status ? { status } : {}),
      ...(assignedTech ? { assignedTech } : {}),
      ...(customerId ? { customerId } : {}),
      ...(priority ? { priority } : {}),
    },
    include: {
      customer: true,
      serviceItem: true,
      contract: true,
      parts: true,
      laborLogs: true,
    },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(orders)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const {
    customerId, serviceItemId, contractId, description,
    priority, assignedTech, estimatedHours, dueDate,
  } = body

  if (!description) {
    return NextResponse.json({ error: 'description is required' }, { status: 400 })
  }

  const order = await prisma.serviceOrder.create({
    data: {
      orderNumber: generateOrderNumber(),
      customerId: customerId ?? null,
      serviceItemId: serviceItemId ?? null,
      contractId: contractId ?? null,
      description,
      priority: priority ?? 'normal',
      status: 'open',
      assignedTech: assignedTech ?? null,
      estimatedHours: estimatedHours ? parseFloat(estimatedHours) : null,
      dueDate: dueDate ? new Date(dueDate) : null,
    },
    include: { customer: true, serviceItem: true },
  })

  return NextResponse.json(order, { status: 201 })
}
