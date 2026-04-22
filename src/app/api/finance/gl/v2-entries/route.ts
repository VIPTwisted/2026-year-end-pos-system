import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { journalId, accountCode, description, debit, credit, entityId } = body

    if (!journalId || !accountCode) {
      return NextResponse.json({ error: 'journalId and accountCode required' }, { status: 400 })
    }

    const journal = await prisma.gLJournal.findUnique({ where: { id: journalId } })
    if (!journal) return NextResponse.json({ error: 'Journal not found' }, { status: 404 })
    if (journal.status !== 'draft') {
      return NextResponse.json({ error: 'Can only add entries to draft journals' }, { status: 400 })
    }

    const entry = await prisma.gLEntry.create({
      data: {
        journalId, accountCode,
        description: description || null,
        debit: debit || 0,
        credit: credit || 0,
        entityId: entityId || null,
      },
      include: { account: { select: { accountCode: true, accountName: true } } },
    })

    return NextResponse.json(entry, { status: 201 })
  } catch (err) {
    console.error('[gl v2-entries POST]', err)
    return NextResponse.json({ error: 'Failed to add entry' }, { status: 500 })
  }
}
