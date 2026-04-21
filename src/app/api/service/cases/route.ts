import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateCaseNumber } from '@/lib/utils'

export async function GET() {
  const cases = await prisma.serviceCase.findMany({
    include: {
      customer: true,
      notes: { orderBy: { createdAt: 'asc' } },
    },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(cases)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { customerId, subject, description, priority, category, assignedTo } = body

  if (!customerId || !subject) {
    return NextResponse.json({ error: 'customerId and subject are required' }, { status: 400 })
  }

  const serviceCase = await prisma.serviceCase.create({
    data: {
      caseNumber: generateCaseNumber(),
      customerId,
      subject,
      description: description ?? null,
      priority: priority ?? 'medium',
      category: category ?? null,
      assignedTo: assignedTo ?? null,
      status: 'open',
    },
    include: { customer: true, notes: true },
  })

  return NextResponse.json(serviceCase, { status: 201 })
}
