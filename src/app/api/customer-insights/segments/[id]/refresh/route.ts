import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const updated = await prisma.cISegment.update({
    where: { id },
    data: { lastRefreshedAt: new Date() },
  })
  return NextResponse.json(updated)
}
