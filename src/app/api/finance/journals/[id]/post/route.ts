import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const journal = await prisma.gLJournal.findUnique({ where: { id }, include: { entries: true } })
    if (!journal) return NextResponse.json({ error: 'Journal not found' }, { status: 404 })
    if (journal.status === 'posted') return NextResponse.json({ error: 'Journal already posted' }, { status: 400 })
    if (journal.entries.length < 2) return NextResponse.json({ error: 'Journal must have at least 2 entries' }, { status: 400 })

    const totalDebit = journal.entries.reduce((s, e) => s + e.debit, 0)
    const totalCredit = journal.entries.reduce((s, e) => s + e.credit, 0)

    if (Math.abs(totalDebit - totalCredit) > 0.001) {
      return NextResponse.json({
        error: `Journal is not balanced. Debits: $${totalDebit.toFixed(2)}, Credits: $${totalCredit.toFixed(2)}`,
      }, { status: 400 })
    }

    const updated = await prisma.gLJournal.update({
      where: { id },
      data: { status: 'posted', postedAt: new Date() },
    })
    return NextResponse.json(updated)
  } catch (err) {
    console.error('[journals post POST]', err)
    return NextResponse.json({ error: 'Failed to post journal' }, { status: 500 })
  }
}
