import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

function currentPeriod(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const journal = await prisma.gLJournal.findUnique({ where: { id }, include: { entries: true } })
    if (!journal) return NextResponse.json({ error: 'Journal not found' }, { status: 404 })
    if (journal.status !== 'posted') return NextResponse.json({ error: 'Only posted journals can be reversed' }, { status: 400 })

    const reversalJournal = await prisma.gLJournal.create({
      data: {
        description: `Reversal of ${journal.journalNumber}: ${journal.description || ''}`.trim(),
        postingDate: new Date(),
        period: currentPeriod(),
        status: 'posted',
        postedAt: new Date(),
        reversedBy: journal.id,
        reversedAt: new Date(),
        entries: {
          create: journal.entries.map(e => ({
            accountCode: e.accountCode,
            description: `Reversal: ${e.description || ''}`.trim(),
            debit: e.credit,
            credit: e.debit,
            entityId: e.entityId || null,
          })),
        },
      },
      include: {
        entries: { include: { account: { select: { accountCode: true, accountName: true } } } },
      },
    })

    await prisma.gLJournal.update({
      where: { id },
      data: { status: 'reversed', reversedBy: reversalJournal.id, reversedAt: new Date() },
    })

    return NextResponse.json(reversalJournal, { status: 201 })
  } catch (err) {
    console.error('[journals reverse POST]', err)
    return NextResponse.json({ error: 'Failed to reverse journal' }, { status: 500 })
  }
}
