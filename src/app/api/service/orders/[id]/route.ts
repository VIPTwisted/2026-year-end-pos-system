import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

type Params = { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params
  const order = await prisma.serviceOrder.findUnique({
    where: { id },
    include: {
      customer: true,
      serviceItem: true,
      contract: true,
      parts: true,
      laborLogs: { orderBy: { logDate: 'desc' } },
    },
  })
  if (!order) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(order)
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const { id } = await params
  const body = await req.json()
  const { action, ...rest } = body

  // Handle special actions
  if (action === 'complete') {
    const order = await prisma.serviceOrder.update({
      where: { id },
      data: { status: 'completed', completedAt: new Date(), ...rest },
      include: { customer: true, serviceItem: true, parts: true, laborLogs: true },
    })
    return NextResponse.json(order)
  }

  if (action === 'cancel') {
    const order = await prisma.serviceOrder.update({
      where: { id },
      data: { status: 'cancelled', cancelledAt: new Date() },
      include: { customer: true, serviceItem: true, parts: true, laborLogs: true },
    })
    return NextResponse.json(order)
  }

  if (action === 'add-part') {
    const { partName, partNumber, quantity, unitCost, productId } = rest
    const qty = parseFloat(quantity) || 1
    const cost = parseFloat(unitCost) || 0
    const part = await prisma.serviceOrderPart.create({
      data: {
        serviceOrderId: id,
        partName,
        partNumber: partNumber ?? null,
        productId: productId ?? null,
        quantity: qty,
        unitCost: cost,
        lineTotal: qty * cost,
      },
    })
    return NextResponse.json(part, { status: 201 })
  }

  if (action === 'remove-part') {
    const { partId } = rest
    await prisma.serviceOrderPart.delete({ where: { id: partId } })
    return NextResponse.json({ ok: true })
  }

  if (action === 'add-labor') {
    const { techName, hoursWorked, notes, logDate } = rest
    const log = await prisma.serviceOrderLabor.create({
      data: {
        serviceOrderId: id,
        techName,
        hoursWorked: parseFloat(hoursWorked) || 0,
        notes: notes ?? null,
        logDate: logDate ? new Date(logDate) : new Date(),
      },
    })
    // update actualHours sum
    const allLogs = await prisma.serviceOrderLabor.findMany({ where: { serviceOrderId: id } })
    const totalHours = allLogs.reduce((s, l) => s + l.hoursWorked, 0)
    await prisma.serviceOrder.update({ where: { id }, data: { actualHours: totalHours } })
    return NextResponse.json(log, { status: 201 })
  }

  // General field update
  const {
    status, priority, assignedTech, estimatedHours, dueDate,
    description, resolutionNotes,
  } = rest

  const order = await prisma.serviceOrder.update({
    where: { id },
    data: {
      ...(status !== undefined ? { status } : {}),
      ...(priority !== undefined ? { priority } : {}),
      ...(assignedTech !== undefined ? { assignedTech } : {}),
      ...(estimatedHours !== undefined ? { estimatedHours: parseFloat(estimatedHours) } : {}),
      ...(dueDate !== undefined ? { dueDate: dueDate ? new Date(dueDate) : null } : {}),
      ...(description !== undefined ? { description } : {}),
      ...(resolutionNotes !== undefined ? { resolutionNotes } : {}),
    },
    include: { customer: true, serviceItem: true, parts: true, laborLogs: true },
  })
  return NextResponse.json(order)
}
