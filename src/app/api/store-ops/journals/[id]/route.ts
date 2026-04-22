import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const journal = await prisma.storeJournal.findUnique({
    where: { id },
    include: { entries: { orderBy: { createdAt: 'asc' } } },
  })
  if (!journal) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(journal)
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const journal = await prisma.storeJournal.update({
    where: { id },
    data: body,
    include: { entries: true },
  })
  return NextResponse.json(journal)
}
