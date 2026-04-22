import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await req.json().catch(() => ({}))
    const approvedBy = body.approvedBy ?? 'system'

    const suggestion = await prisma.replenishmentSuggestion.update({
      where: { id },
      data: { status: 'approved', approvedBy },
    })

    return NextResponse.json(suggestion)
  } catch (error) {
    console.error('POST /api/forecasting/suggestions/[id]/approve error:', error)
    return NextResponse.json({ error: 'Failed to approve suggestion' }, { status: 500 })
  }
}
