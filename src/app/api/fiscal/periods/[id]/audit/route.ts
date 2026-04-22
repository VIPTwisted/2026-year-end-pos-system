import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await req.json()
    const { auditedBy } = body
    const existing = await prisma.fiscalPosSession.findUnique({ where: { id } })
    if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    if (existing.status !== 'closed') {
      return NextResponse.json({ error: 'Period must be closed before auditing' }, { status: 400 })
    }
    const period = await prisma.fiscalPosSession.update({
      where: { id },
      data: {
        status: 'audited',
        auditedBy: auditedBy ?? 'Auditor',
        auditedAt: new Date(),
      },
    })
    await prisma.auditEvent.create({
      data: {
        eventType: 'shift-close',
        description: `Fiscal period "${existing.name}" audited by ${auditedBy ?? 'Auditor'}`,
        storeName: existing.storeName ?? undefined,
        riskLevel: 'low',
      },
    })
    return NextResponse.json(period)
  } catch (error) {
    console.error('[POST /api/fiscal/periods/[id]/audit]', error)
    return NextResponse.json({ error: 'Failed to audit period' }, { status: 500 })
  }
}
