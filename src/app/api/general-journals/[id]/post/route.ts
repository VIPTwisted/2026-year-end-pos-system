import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const journal = await prisma.gLJournal.findUnique({
    where: { id },
    include: { entries: true },
  })

  if (!journal) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (journal.status === 'posted') {
    return NextResponse.json({ error: 'Already posted' }, { status: 400 })
  }
  if (journal.status === 'reversed') {
    return NextResponse.json({ error: 'Cannot post a reversed journal' }, { status: 400 })
  }

  const totalDebit = journal.entries.reduce((s, e) => s + e.debit, 0)
  const totalCredit = journal.entries.reduce((s, e) => s + e.credit, 0)

  if (Math.abs(totalDebit - totalCredit) > 0.01) {
    return NextResponse.json(
      { error: `Journal is unbalanced. Debit: ${totalDebit.toFixed(2)}, Credit: ${totalCredit.toFixed(2)}` },
      { status: 400 }
    )
  }

  const posted = await prisma.gLJournal.update({
    where: { id },
    data: {
      status: 'posted',
      postedAt: new Date(),
      postedBy: 'system',
    },
    include: { entries: true },
  })

  return NextResponse.json(posted)
}
