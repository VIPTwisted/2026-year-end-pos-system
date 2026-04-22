import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  await prisma.storeJournalEntry.updateMany({
    where: { journalId: id, requiresApproval: true },
    data: { approved: true, approvedBy: body.approvedBy },
  })
  const journal = await prisma.storeJournal.update({
    where: { id },
    data: { status: 'approved', approvedBy: body.approvedBy, approvedAt: new Date() },
    include: { entries: true },
  })
  return NextResponse.json(journal)
}
