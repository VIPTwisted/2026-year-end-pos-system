import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const queues = await prisma.caseQueue.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      _count: { select: { cases: true } },
    },
  })
  return NextResponse.json(queues)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { name, description } = body

  if (!name) return NextResponse.json({ error: 'name is required' }, { status: 400 })

  const queue = await prisma.caseQueue.create({
    data: {
      name,
      description: description ?? null,
    },
  })
  return NextResponse.json(queue, { status: 201 })
}
