import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const entries = await prisma.jobQueueEntry.findMany({
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(entries)
}

export async function POST(req: Request) {
  const body = await req.json()
  const entry = await prisma.jobQueueEntry.create({ data: body })
  return NextResponse.json(entry, { status: 201 })
}

export async function PATCH(req: Request) {
  const body = await req.json()
  const { id, ...data } = body
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })
  const entry = await prisma.jobQueueEntry.update({ where: { id }, data })
  return NextResponse.json(entry)
}
