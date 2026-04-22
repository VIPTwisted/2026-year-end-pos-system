import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const policies = await prisma.caseSLA.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      _count: { select: { cases: true } },
    },
  })
  return NextResponse.json(policies)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { name, priority, firstResponseHours, resolutionHours } = body

  if (!name)     return NextResponse.json({ error: 'name is required' },     { status: 400 })
  if (!priority) return NextResponse.json({ error: 'priority is required' }, { status: 400 })

  const policy = await prisma.caseSLA.create({
    data: {
      name,
      priority,
      firstResponseHours: firstResponseHours ?? 4,
      resolutionHours:    resolutionHours    ?? 24,
    },
  })
  return NextResponse.json(policy, { status: 201 })
}
