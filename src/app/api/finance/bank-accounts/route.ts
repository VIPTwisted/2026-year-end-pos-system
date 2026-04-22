import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const accounts = await prisma.bankAccount.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { transactions: true } },
        reconciliations: {
          where: { status: 'completed' },
          orderBy: { statementDate: 'desc' },
          take: 1,
          select: { statementDate: true, completedAt: true },
        },
      },
    })
    return NextResponse.json({ accounts })
  } catch (err) {
    console.error('[GET /api/finance/bank-accounts]', err)
    return NextResponse.json({ error: 'Failed to load bank accounts' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      name: string
      bankName: string
      accountNumber: string
      routingNumber?: string
      accountType?: string
      currentBalance?: number
      currency?: string
      notes?: string
    }

    if (!body.name || !body.bankName || !body.accountNumber) {
      return NextResponse.json({ error: 'name, bankName, and accountNumber are required' }, { status: 400 })
    }

    // Generate a unique account code
    const count = await prisma.bankAccount.count()
    const accountCode = `BANK-${String(count + 1).padStart(4, '0')}`

    const account = await prisma.bankAccount.create({
      data: {
        accountCode,
        name: body.name,
        bankName: body.bankName,
        accountNumber: body.accountNumber,
        routingNumber: body.routingNumber ?? null,
        accountType: body.accountType ?? 'checking',
        currentBalance: body.currentBalance ?? 0,
        currency: body.currency ?? 'USD',
        notes: body.notes ?? null,
      },
    })

    return NextResponse.json(account, { status: 201 })
  } catch (err) {
    console.error('[POST /api/finance/bank-accounts]', err)
    return NextResponse.json({ error: 'Failed to create bank account' }, { status: 500 })
  }
}
