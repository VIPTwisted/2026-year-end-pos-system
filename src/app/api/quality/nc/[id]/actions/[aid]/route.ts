import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; aid: string }> }
) {
  const { aid } = await params
  const body = await req.json()
  const { status, verifiedBy, notes, completedAt } = body

  const updated = await prisma.correctiveAction.update({
    where: { id: aid },
    data: {
      ...(status ? { status } : {}),
      ...(verifiedBy !== undefined ? { verifiedBy } : {}),
      ...(notes !== undefined ? { notes } : {}),
      ...(status === 'completed' ? { completedAt: completedAt ? new Date(completedAt) : new Date() } : {}),
    },
  })

  return NextResponse.json(updated)
}
