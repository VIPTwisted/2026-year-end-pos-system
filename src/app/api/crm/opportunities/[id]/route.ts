import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const opportunity = await prisma.opportunity.findUnique({
      where: { id },
      include: {
        contact: true,
        customer: { select: { id: true, firstName: true, lastName: true, email: true, phone: true } },
        salesCycle: { include: { stages: { orderBy: { stageOrder: 'asc' } } } },
      },
    })
    if (!opportunity) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(opportunity)
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to fetch opportunity' }, { status: 500 })
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await req.json()
    const {
      title, contactId, customerId, salesCycleId, currentStageId,
      estimatedValue, probability, expectedCloseDate, status, assignedTo, notes,
    } = body

    const data: Record<string, unknown> = {}
    if (title !== undefined) data.title = title
    if (contactId !== undefined) data.contactId = contactId
    if (customerId !== undefined) data.customerId = customerId
    if (salesCycleId !== undefined) data.salesCycleId = salesCycleId
    if (currentStageId !== undefined) data.currentStageId = currentStageId
    if (estimatedValue !== undefined) data.estimatedValue = estimatedValue
    if (probability !== undefined) data.probability = probability
    if (expectedCloseDate !== undefined) data.expectedCloseDate = expectedCloseDate ? new Date(expectedCloseDate) : null
    if (status !== undefined) data.status = status
    if (assignedTo !== undefined) data.assignedTo = assignedTo
    if (notes !== undefined) data.notes = notes

    const updated = await prisma.opportunity.update({
      where: { id },
      data,
      include: {
        contact: true,
        customer: { select: { id: true, firstName: true, lastName: true } },
        salesCycle: { include: { stages: { orderBy: { stageOrder: 'asc' } } } },
      },
    })
    return NextResponse.json(updated)
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to update opportunity' }, { status: 500 })
  }
}
