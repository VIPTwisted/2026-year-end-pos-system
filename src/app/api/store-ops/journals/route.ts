import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const storeId = searchParams.get('storeId')
  const status = searchParams.get('status')
  const date = searchParams.get('date')

  const where: Record<string, unknown> = {}
  if (storeId) where.storeId = storeId
  if (status) where.status = status
  if (date) {
    const d = new Date(date)
    const next = new Date(d)
    next.setDate(next.getDate() + 1)
    where.date = { gte: d, lt: next }
  }

  const journals = await prisma.storeJournal.findMany({
    where,
    include: { entries: true },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(journals)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const journal = await prisma.storeJournal.create({
    data: {
      storeId: body.storeId,
      storeName: body.storeName,
      date: body.date ? new Date(body.date) : undefined,
      notes: body.notes,
    },
  })
  return NextResponse.json(journal, { status: 201 })
}
