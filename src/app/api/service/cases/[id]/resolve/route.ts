import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const existing = await prisma.serviceCase2.findUnique({ where: { id } })
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const now = new Date()
  const slaBreached = existing.slaDueAt ? now > existing.slaDueAt : false

  const updated = await prisma.serviceCase2.update({
    where: { id },
    data: {
      status:     'resolved',
      resolvedAt: now,
      slaBreached,
    },
    include: { notes: true, satisfaction: true, queue: true, sla: true },
  })

  // Add system note
  await prisma.caseNote.create({
    data: {
      caseId:     id,
      noteType:   'system',
      body:       `Case resolved${slaBreached ? ' (SLA breached)' : ''}.`,
      authorName: 'System',
    },
  })

  return NextResponse.json(updated)
}
