import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const accounts = await prisma.bankAccount.findMany({
      include: {
        glAccount: { select: { id: true, code: true, name: true } },
        statements: {
          orderBy: { statementDate: 'desc' },
          take: 1,
          select: {
            id: true,
            statementDate: true,
            openingBalance: true,
            closingBalance: true,
            status: true,
            importedAt: true,
          },
        },
      },
      orderBy: [{ isPrimary: 'desc' }, { createdAt: 'asc' }],
    })

    return NextResponse.json(accounts)
  } catch (error) {
    console.error('[GET /api/bank]', error)
    return NextResponse.json({ error: 'Failed to fetch bank accounts' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      accountCode,
      bankName,
      accountNumber,
      accountType = 'checking',
      currency = 'USD',
      currentBalance = 0,
      glAccountId,
      isPrimary = false,
    } = body

    if (!accountCode || !bankName || !accountNumber) {
      return NextResponse.json(
        { error: 'accountCode, bankName, and accountNumber are required' },
        { status: 400 }
      )
    }

    // If setting as primary, unset any existing primary
    if (isPrimary) {
      await prisma.bankAccount.updateMany({
        where: { isPrimary: true },
        data: { isPrimary: false },
      })
    }

    const account = await prisma.bankAccount.create({
      data: {
        accountCode,
        bankName,
        accountNumber,
        accountType,
        currency,
        currentBalance,
        glAccountId: glAccountId || null,
        isPrimary,
        isActive: true,
      },
      include: {
        glAccount: { select: { id: true, code: true, name: true } },
      },
    })

    return NextResponse.json(account, { status: 201 })
  } catch (error: unknown) {
    console.error('[POST /api/bank]', error)
    if (
      error instanceof Error &&
      error.message.includes('Unique constraint failed')
    ) {
      return NextResponse.json({ error: 'Account code already exists' }, { status: 409 })
    }
    return NextResponse.json({ error: 'Failed to create bank account' }, { status: 500 })
  }
}
