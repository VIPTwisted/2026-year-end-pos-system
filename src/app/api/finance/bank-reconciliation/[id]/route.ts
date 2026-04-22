import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const recon = await prisma.bankReconciliation.findUnique({
      where: { id: params.id },
      include: { lines: { orderBy: { createdAt: 'asc' } } },
    })
    if (!recon) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json({ reconciliation: recon })
  } catch (err) {
    console.error('[bank-reconciliation/[id] GET]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const body = await req.json()

    if (body.action === 'post') {
      const updated = await prisma.bankReconciliation.update({
        where: { id: params.id },
        data: { status: 'completed' },
      })
      return NextResponse.json({ reconciliation: updated })
    }

    if (body.action === 'match-line') {
      // Mark a bank reconciliation line as matched
      const { lineId, matched } = body
      const line = await prisma.bankReconciliationLine.update({
        where: { id: lineId },
        data: { status: matched ? 'matched' : 'open' },
      })
      return NextResponse.json({ line })
    }

    if (body.action === 'add-line') {
      const line = await prisma.bankReconciliationLine.create({
        data: {
          reconciliationId: params.id,
          transactionDate: body.transactionDate ? new Date(body.transactionDate) : new Date(),
          description: body.description ?? null,
          statementAmount: parseFloat(body.statementAmount) || 0,
          appliedAmount: parseFloat(body.appliedAmount) || 0,
          type: body.type ?? 'Difference',
          status: 'open',
        },
      })
      return NextResponse.json({ line })
    }

    // Generic field update
    const updated = await prisma.bankReconciliation.update({
      where: { id: params.id },
      data: {
        closingBalance: body.closingBalance !== undefined ? parseFloat(body.closingBalance) : undefined,
        openingBalance: body.openingBalance !== undefined ? parseFloat(body.openingBalance) : undefined,
        statementNo: body.statementNo ?? undefined,
        statementDate: body.statementDate ? new Date(body.statementDate) : undefined,
        status: body.status ?? undefined,
      },
    })
    return NextResponse.json({ reconciliation: updated })
  } catch (err) {
    console.error('[bank-reconciliation/[id] PATCH]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    await prisma.bankReconciliation.delete({ where: { id: params.id } })
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[bank-reconciliation/[id] DELETE]', err)
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 })
  }
}
