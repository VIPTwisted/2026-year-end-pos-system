import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const groupId = searchParams.get('groupId')

  try {
    const entries = await prisma.eliminationEntry.findMany({
      where: { ...(groupId ? { groupId } : {}) },
      orderBy: { entryDate: 'desc' },
      take: 200,
    })
    return NextResponse.json(entries)
  } catch {
    return NextResponse.json({ error: 'Elimination entries unavailable' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const entry = await prisma.eliminationEntry.create({ data: body })
    return NextResponse.json(entry, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Failed to create elimination entry' }, { status: 500 })
  }
}
