import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status')
  const source = searchParams.get('source')
  const assignedTo = searchParams.get('assignedTo')

  const where: Record<string, string> = {}
  if (status && status !== 'all') where.status = status
  if (source && source !== 'all') where.source = source
  if (assignedTo) where.assignedTo = assignedTo

  const leads = await prisma.lead.findMany({
    where,
    include: { activities: { orderBy: { createdAt: 'desc' }, take: 1 } },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(leads)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const lead = await prisma.lead.create({
    data: {
      firstName: body.firstName ?? null,
      lastName: body.lastName ?? null,
      email: body.email ?? null,
      phone: body.phone ?? null,
      company: body.company ?? null,
      source: body.source ?? 'web',
      status: body.status ?? 'new',
      score: body.score ?? 0,
      assignedTo: body.assignedTo ?? null,
      notes: body.notes ?? null,
    },
  })
  return NextResponse.json(lead, { status: 201 })
}
