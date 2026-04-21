import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: statementId } = await params

    const statement = await prisma.bankStatement.findUnique({
      where: { id: statementId },
      include: { lines: true },
    })

    if (!statement) {
      return NextResponse.json({ error: 'Statement not found' }, { status: 404 })
    }

    if (statement.status === 'reconciled') {
      return NextResponse.json({ error: 'Statement is already reconciled' }, { status: 409 })
    }

    const unmatchedCount = statement.lines.filter(l => l.matchingStatus === 'unmatched').length
    if (unmatchedCount > 0) {
      return NextResponse.json(
        { error: `${unmatchedCount} unmatched line(s) remain — resolve before completing reconciliation` },
        { status: 422 }
      )
    }

    const updated = await prisma.bankStatement.update({
      where: { id: statementId },
      data: {
        status: 'reconciled',
        reconciledAt: new Date(),
      },
      include: {
        bankAccount: { select: { id: true, bankName: true, accountCode: true } },
        lines: true,
      },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('[POST /api/bank/statements/[id]/reconcile]', error)
    return NextResponse.json({ error: 'Failed to complete reconciliation' }, { status: 500 })
  }
}
