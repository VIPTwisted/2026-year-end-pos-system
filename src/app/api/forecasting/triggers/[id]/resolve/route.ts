import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const trigger = await prisma.reorderTrigger.update({
      where: { id },
      data: { resolved: true, resolvedAt: new Date() },
    })
    return NextResponse.json(trigger)
  } catch (error) {
    console.error('POST /api/forecasting/triggers/[id]/resolve error:', error)
    return NextResponse.json({ error: 'Failed to resolve trigger' }, { status: 500 })
  }
}
