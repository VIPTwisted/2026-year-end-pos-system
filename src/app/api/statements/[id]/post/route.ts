import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const stmt = await prisma.commerceStatement.findUnique({ where: { id } })
  if (!stmt) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (stmt.status !== 'calculated') {
    return NextResponse.json({ error: 'Statement must be calculated before posting' }, { status: 400 })
  }
  if (stmt.status === 'posted') {
    return NextResponse.json({ error: 'Already posted' }, { status: 400 })
  }

  const updated = await prisma.commerceStatement.update({
    where: { id },
    data: { status: 'posted', postedAt: new Date() },
  })

  return NextResponse.json(updated)
}
