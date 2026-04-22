import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const account = await prisma.bankAccount.findUnique({
      where: { id },
      include: {
        transactions: {
          orderBy: { date: 'desc' },
          take: 50,
        },
        reconciliations: {
          orderBy: { statementDate: 'desc' },
          take: 10,
        },
      },
    })

    if (!account) {
      return NextResponse.json({ error: 'Bank account not found' }, { status: 404 })
    }

    return NextResponse.json(account)
  } catch (err) {
    console.error('[GET /api/finance/bank-accounts/[id]]', err)
    return NextResponse.json({ error: 'Failed to load bank account' }, { status: 500 })
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = (await req.json()) as {
      name?: string
      bankName?: string
      accountNumber?: string
      routingNumber?: string
      accountType?: string
      currency?: string
      notes?: string
      isActive?: boolean
      isPrimary?: boolean
    }

    const account = await prisma.bankAccount.update({
      where: { id },
      data: {
        ...(body.name !== undefined && { name: body.name }),
        ...(body.bankName !== undefined && { bankName: body.bankName }),
        ...(body.accountNumber !== undefined && { accountNumber: body.accountNumber }),
        ...(body.routingNumber !== undefined && { routingNumber: body.routingNumber }),
        ...(body.accountType !== undefined && { accountType: body.accountType }),
        ...(body.currency !== undefined && { currency: body.currency }),
        ...(body.notes !== undefined && { notes: body.notes }),
        ...(body.isActive !== undefined && { isActive: body.isActive }),
        ...(body.isPrimary !== undefined && { isPrimary: body.isPrimary }),
      },
    })

    return NextResponse.json(account)
  } catch (err) {
    console.error('[PATCH /api/finance/bank-accounts/[id]]', err)
    return NextResponse.json({ error: 'Failed to update bank account' }, { status: 500 })
  }
}
