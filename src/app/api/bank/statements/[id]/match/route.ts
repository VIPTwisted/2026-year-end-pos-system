import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: statementId } = await params
    const body = await req.json()
    const { statementLineId, matchedToId, matchedToType } = body

    if (!statementLineId || !matchedToId) {
      return NextResponse.json(
        { error: 'statementLineId and matchedToId are required' },
        { status: 400 }
      )
    }

    // Verify the line belongs to this statement
    const line = await prisma.bankStatementLine.findFirst({
      where: { id: statementLineId, statementId },
    })
    if (!line) {
      return NextResponse.json(
        { error: 'Statement line not found on this statement' },
        { status: 404 }
      )
    }

    const updated = await prisma.bankStatementLine.update({
      where: { id: statementLineId },
      data: {
        matchingStatus: matchedToType === 'manual' ? 'manual' : 'matched',
        matchedToId,
      },
    })

    // Update statement status to in_progress if it was pending
    await prisma.bankStatement.update({
      where: { id: statementId },
      data: { status: 'in_progress' },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('[POST /api/bank/statements/[id]/match]', error)
    return NextResponse.json({ error: 'Failed to match line' }, { status: 500 })
  }
}
