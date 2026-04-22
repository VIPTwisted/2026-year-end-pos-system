import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const item = await prisma.orderQueue.findUnique({ where: { id } })
  if (!item) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const updated = await prisma.orderQueue.update({
    where: { id },
    data: {
      status: 'pending',
      retryCount: 0,
      errorMessage: null,
      processedAt: null,
    },
  })
  return NextResponse.json(updated)
}
