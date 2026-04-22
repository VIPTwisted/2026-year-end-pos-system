import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const sp = req.nextUrl.searchParams
    const from = sp.get('from')
    const to = sp.get('to')

    const transactions = await prisma.bankTransaction.findMany({
      where: {
        accountId: id,
        ...(from || to
          ? {
              date: {
                ...(from ? { gte: new Date(from) } : {}),
                ...(to ? { lte: new Date(to) } : {}),
              },
            }
          : {}),
      },
      orderBy: { date: 'desc' },
    })

    return NextResponse.json({ transactions })
  } catch (err) {
    console.error('[GET /api/finance/bank-accounts/[id]/transactions]', err)
    return NextResponse.json({ error: 'Failed to load transactions' }, { status: 500 })
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = (await req.json()) as {
      date: string
      description: string
      amount: number
      reference?: string
      category?: string
    }

    if (!body.date || !body.description || body.amount === undefined) {
      return NextResponse.json({ error: 'date, description, and amount are required' }, { status: 400 })
    }

    const account = await prisma.bankAccount.findUnique({ where: { id } })
    if (!account) {
      return NextResponse.json({ error: 'Bank account not found' }, { status: 404 })
    }

    const newBalance = account.currentBalance + body.amount

    const [transaction] = await prisma.$transaction([
      prisma.bankTransaction.create({
        data: {
          accountId: id,
          date: new Date(body.date),
          description: body.description,
          amount: body.amount,
          runningBalance: newBalance,
          reference: body.reference ?? null,
          category: body.category ?? null,
        },
      }),
      prisma.bankAccount.update({
        where: { id },
        data: { currentBalance: newBalance },
      }),
    ])

    return NextResponse.json(transaction, { status: 201 })
  } catch (err) {
    console.error('[POST /api/finance/bank-accounts/[id]/transactions]', err)
    return NextResponse.json({ error: 'Failed to add transaction' }, { status: 500 })
  }
}
