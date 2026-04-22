import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const status     = searchParams.get('status')
  const priority   = searchParams.get('priority')
  const queueId    = searchParams.get('queueId')
  const assignedTo = searchParams.get('assignedTo')
  const search     = searchParams.get('search') ?? ''

  const where: Record<string, unknown> = {}
  if (status && status !== 'all')     where.status     = status
  if (priority && priority !== 'all') where.priority   = priority
  if (queueId)                        where.queueId    = queueId
  if (assignedTo)                     where.assignedTo = assignedTo
  if (search) {
    where.OR = [
      { caseNumber:   { contains: search } },
      { subject:      { contains: search } },
      { customerName: { contains: search } },
    ]
  }

  const cases = await prisma.serviceCase2.findMany({
    where,
    include: {
      queue: true,
      sla:   true,
    },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(cases)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const {
    subject, description, customerName, customerEmail,
    customerId, channel, priority, queueId, assignedTo,
    orderId, tags,
  } = body

  if (!subject) {
    return NextResponse.json({ error: 'subject is required' }, { status: 400 })
  }

  const effectivePriority = priority ?? 'medium'

  // Auto-compute slaDueAt from SLA policy by priority
  const slaPolicy = await prisma.caseSLA.findFirst({
    where: { priority: effectivePriority, isActive: true },
  })

  let slaDueAt: Date | null = null
  let slaId: string | null = null
  if (slaPolicy) {
    slaDueAt = new Date(Date.now() + slaPolicy.resolutionHours * 60 * 60 * 1000)
    slaId = slaPolicy.id
  }

  const serviceCase = await prisma.serviceCase2.create({
    data: {
      subject,
      description:   description   ?? null,
      customerName:  customerName  ?? null,
      customerEmail: customerEmail ?? null,
      customerId:    customerId    ?? null,
      channel:       channel       ?? null,
      priority:      effectivePriority,
      queueId:       queueId       ?? null,
      assignedTo:    assignedTo    ?? null,
      orderId:       orderId       ?? null,
      tags:          tags          ?? null,
      slaId,
      slaDueAt,
    },
    include: { queue: true, sla: true },
  })

  return NextResponse.json(serviceCase, { status: 201 })
}
