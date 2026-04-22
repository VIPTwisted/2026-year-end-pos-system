import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const opp = await prisma.salesOpportunity.update({
      where: { id },
      data: { isLost: true, isWon: false, salesStage: 'closed_lost', closedAt: new Date(), probability: 0 },
    })
    return NextResponse.json(opp)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to close opportunity as lost' }, { status: 500 })
  }
}
