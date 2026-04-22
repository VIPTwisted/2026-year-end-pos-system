import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const [reconciliation, unreconciledTx] = await Promise.all([
      prisma.bankReconciliation.findFirst({
        where: { accountId: id, status: 'open' },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.bankTransaction.findMany({
        where: { accountId: id, isReconciled: false },
        orderBy: { date: 'asc' },
      }),
    ])

    return NextResponse.json({ reconciliation, unreconciledTransactions: unreconciledTx })
  } catch (err) {
    console.error('[GET /api/finance/bank-accounts/[id]/reconcile]', err)
    return NextResponse.json({ error: 'Failed to load reconciliation status' }, { status: 500 })
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = (await req.json()) as {
      statementDate: string
      statementBalance: number
      action: 'start' | 'complete'
      clearedTransactionIds?: string[]
      notes?: string
    }

    if (!body.statementDate || body.statementBalance === undefined || !body.action) {
      return NextResponse.json(
        { error: 'statementDate, statementBalance, and action are required' },
        { status: 400 }
      )
    }

    const account = await prisma.bankAccount.findUnique({ where: { id } })
    if (!account) {
      return NextResponse.json({ error: 'Bank account not found' }, { status: 404 })
    }

    if (body.action === 'start') {
      const reconciliation = await prisma.bankReconciliation.create({
        data: {
          accountId: id,
          statementDate: new Date(body.statementDate),
          statementBalance: body.statementBalance,
          clearedBalance: 0,
          difference: body.statementBalance,
          status: 'open',
          notes: body.notes ?? null,
        },
      })
      return NextResponse.json(reconciliation, { status: 201 })
    }

    if (body.action === 'complete') {
      const clearedIds = body.clearedTransactionIds ?? []

      // Calculate cleared balance from the selected transactions
      const clearedTransactions = await prisma.bankTransaction.findMany({
        where: { id: { in: clearedIds }, accountId: id },
      })
      const sumCleared = clearedTransactions.reduce((s, t) => s + t.amount, 0)
      const difference = body.statementBalance - sumCleared

      const now = new Date()

      // Mark selected transactions as reconciled
      if (clearedIds.length > 0) {
        await prisma.bankTransaction.updateMany({
          where: { id: { in: clearedIds }, accountId: id },
          data: { isReconciled: true, reconciledAt: now },
        })
      }

      // Find open reconciliation or create one
      let recon = await prisma.bankReconciliation.findFirst({
        where: { accountId: id, status: 'open' },
        orderBy: { createdAt: 'desc' },
      })

      if (!recon) {
        recon = await prisma.bankReconciliation.create({
          data: {
            accountId: id,
            statementDate: new Date(body.statementDate),
            statementBalance: body.statementBalance,
            clearedBalance: sumCleared,
            difference,
            status: 'open',
          },
        })
      }

      const completed = await prisma.bankReconciliation.update({
        where: { id: recon.id },
        data: {
          statementDate: new Date(body.statementDate),
          statementBalance: body.statementBalance,
          clearedBalance: sumCleared,
          difference,
          status: 'completed',
          completedAt: now,
          notes: body.notes ?? recon.notes,
        },
      })

      return NextResponse.json(completed)
    }

    return NextResponse.json({ error: 'Invalid action. Use "start" or "complete"' }, { status: 400 })
  } catch (err) {
    console.error('[POST /api/finance/bank-accounts/[id]/reconcile]', err)
    return NextResponse.json({ error: 'Failed to process reconciliation' }, { status: 500 })
  }
}
