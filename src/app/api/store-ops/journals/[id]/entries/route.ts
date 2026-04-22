import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const entries = await prisma.storeJournalEntry.findMany({
    where: { journalId: id },
    orderBy: { createdAt: 'asc' },
  })
  return NextResponse.json(entries)
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const entry = await prisma.storeJournalEntry.create({
    data: {
      journalId: id,
      entryType: body.entryType,
      amount: body.amount ?? 0,
      qty: body.qty ?? 1,
      description: body.description,
      authorName: body.authorName,
      referenceId: body.referenceId,
      requiresApproval: body.requiresApproval ?? false,
    },
  })
  return NextResponse.json(entry, { status: 201 })
}
