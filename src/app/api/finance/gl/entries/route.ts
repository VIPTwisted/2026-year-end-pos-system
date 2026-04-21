import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const entries = await prisma.journalEntry.findMany({
      include: {
        lines: {
          include: { account: true },
        },
      },
      orderBy: { date: 'desc' },
      take: 50,
    })
    return NextResponse.json({ entries })
  } catch (err) {
    console.error('[GET /api/finance/gl/entries]', err)
    return NextResponse.json({ error: 'Failed to load journal entries' }, { status: 500 })
  }
}

interface LineInput {
  accountId: string
  debit: number
  credit: number
  memo?: string | null
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { reference, description, date, lines = [], createdBy } = body

    if (!reference) {
      return NextResponse.json({ error: 'reference is required' }, { status: 400 })
    }

    if (!Array.isArray(lines) || lines.length < 2) {
      return NextResponse.json({ error: 'At least 2 journal lines are required' }, { status: 400 })
    }

    const validLines: LineInput[] = lines.filter(
      (l: LineInput) => l.accountId && (l.debit > 0 || l.credit > 0)
    )

    if (validLines.length < 2) {
      return NextResponse.json(
        { error: 'At least 2 lines with amounts are required' },
        { status: 400 }
      )
    }

    const totalDebits = validLines.reduce((s, l) => s + (l.debit ?? 0), 0)
    const totalCredits = validLines.reduce((s, l) => s + (l.credit ?? 0), 0)

    if (Math.abs(totalDebits - totalCredits) > 0.01) {
      return NextResponse.json(
        {
          error: `Journal entry is out of balance. Debits: ${totalDebits.toFixed(2)}, Credits: ${totalCredits.toFixed(2)}`,
        },
        { status: 422 }
      )
    }

    const entry = await prisma.$transaction(async (tx) => {
      // Create the journal entry
      const created = await tx.journalEntry.create({
        data: {
          reference,
          description: description ?? null,
          date: date ? new Date(date) : new Date(),
          status: 'posted',
          createdBy: createdBy ?? null,
          lines: {
            create: validLines.map((l) => ({
              accountId: l.accountId,
              debit: l.debit ?? 0,
              credit: l.credit ?? 0,
              memo: l.memo ?? null,
            })),
          },
        },
        include: {
          lines: {
            include: { account: true },
          },
        },
      })

      // Update account balances
      // For each line: debit increases the account's raw balance; credit decreases it.
      // This is a simplified running balance (not type-adjusted).
      for (const line of validLines) {
        const delta = (line.debit ?? 0) - (line.credit ?? 0)
        if (delta !== 0) {
          await tx.account.update({
            where: { id: line.accountId },
            data: { balance: { increment: delta } },
          })
        }
      }

      return created
    })

    return NextResponse.json({ entry }, { status: 201 })
  } catch (err: unknown) {
    console.error('[POST /api/finance/gl/entries]', err)
    if (
      typeof err === 'object' &&
      err !== null &&
      'code' in err &&
      (err as { code: string }).code === 'P2002'
    ) {
      return NextResponse.json(
        { error: 'A journal entry with that reference already exists' },
        { status: 409 }
      )
    }
    return NextResponse.json({ error: 'Failed to create journal entry' }, { status: 500 })
  }
}
