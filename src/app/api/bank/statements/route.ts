import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const bankAccountId = searchParams.get('bankAccountId')

    const statements = await prisma.bankStatement.findMany({
      where: bankAccountId ? { bankAccountId } : undefined,
      include: {
        bankAccount: { select: { id: true, bankName: true, accountCode: true, accountNumber: true } },
        lines: { orderBy: { transactionDate: 'asc' } },
      },
      orderBy: { statementDate: 'desc' },
    })

    return NextResponse.json(statements)
  } catch (error) {
    console.error('[GET /api/bank/statements]', error)
    return NextResponse.json({ error: 'Failed to fetch statements' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { bankAccountId, statementDate, openingBalance, closingBalance, lines = [] } = body

    if (!bankAccountId || !statementDate || openingBalance == null || closingBalance == null) {
      return NextResponse.json(
        { error: 'bankAccountId, statementDate, openingBalance, and closingBalance are required' },
        { status: 400 }
      )
    }

    const account = await prisma.bankAccount.findUnique({ where: { id: bankAccountId } })
    if (!account) {
      return NextResponse.json({ error: 'Bank account not found' }, { status: 404 })
    }

    const statement = await prisma.bankStatement.create({
      data: {
        bankAccountId,
        statementDate: new Date(statementDate),
        openingBalance: Number(openingBalance),
        closingBalance: Number(closingBalance),
        status: 'pending',
        lines: {
          create: lines.map((line: {
            transactionDate: string
            description: string
            amount: number
            transactionType: string
            reference?: string
          }) => ({
            transactionDate: new Date(line.transactionDate),
            description: line.description,
            amount: Number(line.amount),
            transactionType: line.transactionType ?? 'deposit',
            reference: line.reference ?? null,
            matchingStatus: 'unmatched',
          })),
        },
      },
      include: {
        bankAccount: { select: { id: true, bankName: true, accountCode: true, accountNumber: true } },
        lines: { orderBy: { transactionDate: 'asc' } },
      },
    })

    return NextResponse.json(statement, { status: 201 })
  } catch (error) {
    console.error('[POST /api/bank/statements]', error)
    return NextResponse.json({ error: 'Failed to create statement' }, { status: 500 })
  }
}
