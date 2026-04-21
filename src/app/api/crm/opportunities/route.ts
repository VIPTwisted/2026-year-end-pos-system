import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')

    const where: Record<string, unknown> = {}
    if (status) where.status = status

    const opportunities = await prisma.opportunity.findMany({
      where,
      include: {
        contact: { select: { id: true, firstName: true, lastName: true, email: true } },
        customer: { select: { id: true, firstName: true, lastName: true } },
        salesCycle: { select: { id: true, name: true, stages: { orderBy: { stageOrder: 'asc' } } } },
      },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(opportunities)
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to fetch opportunities' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      title, contactId, customerId, salesCycleId, currentStageId,
      estimatedValue, probability, expectedCloseDate, status, assignedTo, notes,
    } = body

    if (!title) {
      return NextResponse.json({ error: 'title is required' }, { status: 400 })
    }

    const opportunity = await prisma.opportunity.create({
      data: {
        title,
        contactId: contactId ?? null,
        customerId: customerId ?? null,
        salesCycleId: salesCycleId ?? null,
        currentStageId: currentStageId ?? null,
        estimatedValue: estimatedValue ?? 0,
        probability: probability ?? 0,
        expectedCloseDate: expectedCloseDate ? new Date(expectedCloseDate) : null,
        status: status ?? 'open',
        assignedTo: assignedTo ?? null,
        notes: notes ?? null,
      },
      include: {
        contact: true,
        customer: { select: { id: true, firstName: true, lastName: true } },
        salesCycle: { select: { id: true, name: true } },
      },
    })
    return NextResponse.json(opportunity, { status: 201 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to create opportunity' }, { status: 500 })
  }
}
