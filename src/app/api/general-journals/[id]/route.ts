import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const journal = await prisma.gLJournal.findUnique({
    where: { id },
    include: {
      entries: {
        include: { account: true },
        orderBy: { createdAt: 'asc' },
      },
    },
  })
  if (!journal) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(journal)
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await req.json()
  const updated = await prisma.gLJournal.update({
    where: { id },
    data: body,
    include: { entries: true },
  })
  return NextResponse.json(updated)
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const journal = await prisma.gLJournal.findUnique({ where: { id } })
  if (!journal) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (journal.status === 'posted') {
    return NextResponse.json({ error: 'Cannot delete a posted journal' }, { status: 400 })
  }
  await prisma.gLJournal.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
