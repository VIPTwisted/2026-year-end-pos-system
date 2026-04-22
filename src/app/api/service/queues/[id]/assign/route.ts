import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: queueId } = await params
  const { caseId } = await req.json()
  if (!caseId) return NextResponse.json({ error: 'caseId required' }, { status: 400 })

  // Remove existing queue items for this case first
  await prisma.serviceQueueItem.deleteMany({ where: { caseId } })

  const item = await prisma.serviceQueueItem.create({
    data: { queueId, caseId, status: 'waiting' },
    include: { queue: true, case: { include: { customer: true } } },
  })
  return NextResponse.json(item, { status: 201 })
}
