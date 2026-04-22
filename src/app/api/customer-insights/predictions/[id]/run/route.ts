import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const updated = await prisma.cIPredictionModel.update({
    where: { id },
    data: { lastRunAt: new Date(), status: 'running' },
  })
  return NextResponse.json(updated)
}
