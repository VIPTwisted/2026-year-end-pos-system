import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const injuryCase = await prisma.injuryCase.findUnique({ where: { id } })
  if (!injuryCase) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(injuryCase)
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const data: Record<string, unknown> = {}

  if (body.action === 'start_investigation') {
    data.status = 'investigating'
  } else if (body.action === 'close') {
    data.status = 'closed'
    data.closedAt = new Date()
    if (body.rootCause) data.rootCause = body.rootCause
    if (body.correctiveAction) data.correctiveAction = body.correctiveAction
  } else {
    const fields = ['description', 'injuryType', 'bodyPart', 'severity', 'daysLost',
      'recordable', 'oshaRecordable', 'treatment', 'rootCause', 'correctiveAction',
      'witnesses', 'status', 'location']
    for (const f of fields) {
      if (body[f] !== undefined) data[f] = body[f]
    }
  }

  const updated = await prisma.injuryCase.update({ where: { id }, data })
  return NextResponse.json(updated)
}
