import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const updated = await prisma.cIEnrichment.update({
    where: { id },
    data: { lastRunAt: new Date(), status: 'active' },
  })
  return NextResponse.json(updated)
}
