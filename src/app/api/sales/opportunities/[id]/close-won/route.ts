import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const opp = await prisma.salesOpportunity.update({
      where: { id },
      data: { isWon: true, isLost: false, salesStage: 'closed_won', closedAt: new Date(), probability: 100 },
    })
    return NextResponse.json(opp)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to close opportunity as won' }, { status: 500 })
  }
}
