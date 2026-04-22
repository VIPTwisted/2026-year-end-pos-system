import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status')
  const type = searchParams.get('type')

  const where: Record<string, string> = {}
  if (status && status !== 'all') where.status = status
  if (type && type !== 'all') where.journalType = type

  const journals = await prisma.gLJournal.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: {
      entries: {
        select: {
          id: true,
          debit: true,
          credit: true,
        },
      },
    },
  })

  const enriched = journals.map((j) => ({
    ...j,
    lineCount: j.entries.length,
    debitTotal: j.entries.reduce((s, e) => s + e.debit, 0),
    creditTotal: j.entries.reduce((s, e) => s + e.credit, 0),
  }))

  return NextResponse.json(enriched)
}

export async function POST(req: Request) {
  const body = await req.json()

  const { description, postingDate, period, journalType, lines } = body as {
    description: string
    postingDate: string
    period: string
    journalType: string
    lines: Array<{
      accountCode: string
      description: string
      debit: number
      credit: number
      entityId?: string
      entityName?: string
    }>
  }

  const journal = await prisma.gLJournal.create({
    data: {
      description,
      postingDate: new Date(postingDate),
      period,
      status: 'draft',
      entries: {
        create: lines.map((l) => ({
          accountCode: l.accountCode,
          description: l.description ?? null,
          debit: l.debit ?? 0,
          credit: l.credit ?? 0,
          entityId: l.entityId ?? null,
          entityName: l.entityName ?? null,
        })),
      },
    },
    include: { entries: true },
  })

  return NextResponse.json(journal, { status: 201 })
}
