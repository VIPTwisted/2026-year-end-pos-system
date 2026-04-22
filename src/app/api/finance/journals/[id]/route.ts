import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const journal = await prisma.gLJournal.findUnique({
      where: { id },
      include: {
        entries: { include: { account: true }, orderBy: { createdAt: 'asc' } },
      },
    })
    if (!journal) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(journal)
  } catch (err) {
    console.error('[journals [id] GET]', err)
    return NextResponse.json({ error: 'Failed to fetch journal' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await req.json()
    const { description, postingDate, period } = body
    const journal = await prisma.gLJournal.update({
      where: { id },
      data: {
        ...(description !== undefined && { description }),
        ...(postingDate !== undefined && { postingDate: new Date(postingDate) }),
        ...(period !== undefined && { period }),
      },
      include: {
        entries: { include: { account: { select: { accountCode: true, accountName: true } } } },
      },
    })
    return NextResponse.json(journal)
  } catch (err) {
    console.error('[journals [id] PATCH]', err)
    return NextResponse.json({ error: 'Failed to update journal' }, { status: 500 })
  }
}
