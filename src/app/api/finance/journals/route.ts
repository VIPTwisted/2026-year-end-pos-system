import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

function currentPeriod(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')
    const period = searchParams.get('period')
    const journals = await prisma.gLJournal.findMany({
      where: {
        ...(status && { status }),
        ...(period && { period }),
      },
      orderBy: { createdAt: 'desc' },
      include: {
        entries: {
          include: { account: { select: { accountCode: true, accountName: true } } },
        },
      },
    })
    return NextResponse.json(journals)
  } catch (err) {
    console.error('[journals GET]', err)
    return NextResponse.json({ error: 'Failed to fetch journals' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { description, postingDate, period, entries } = body

    if (!entries || !Array.isArray(entries) || entries.length < 2) {
      return NextResponse.json({ error: 'At least 2 entries required' }, { status: 400 })
    }

    const totalDebit = entries.reduce((s: number, e: { debit?: number }) => s + (e.debit || 0), 0)
    const totalCredit = entries.reduce((s: number, e: { credit?: number }) => s + (e.credit || 0), 0)

    if (Math.abs(totalDebit - totalCredit) > 0.001) {
      return NextResponse.json({
        error: `Journal is not balanced. Debits: $${totalDebit.toFixed(2)}, Credits: $${totalCredit.toFixed(2)}`,
      }, { status: 400 })
    }

    const journal = await prisma.gLJournal.create({
      data: {
        description: description || null,
        postingDate: postingDate ? new Date(postingDate) : new Date(),
        period: period || currentPeriod(),
        status: 'draft',
        entries: {
          create: entries.map((e: { accountCode: string; description?: string; debit?: number; credit?: number; entityId?: string }) => ({
            accountCode: e.accountCode,
            description: e.description || null,
            debit: e.debit || 0,
            credit: e.credit || 0,
            entityId: e.entityId || null,
          })),
        },
      },
      include: {
        entries: {
          include: { account: { select: { accountCode: true, accountName: true } } },
        },
      },
    })

    return NextResponse.json(journal, { status: 201 })
  } catch (err) {
    console.error('[journals POST]', err)
    return NextResponse.json({ error: 'Failed to create journal' }, { status: 500 })
  }
}
