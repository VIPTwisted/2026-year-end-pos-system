import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const journal = await prisma.storeJournal.update({
    where: { id },
    data: { status: 'submitted', submittedBy: body.submittedBy },
    include: { entries: true },
  })
  return NextResponse.json(journal)
}
