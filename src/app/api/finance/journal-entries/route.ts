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
      take: 100,
    })
    return NextResponse.json({ entries })
  } catch (err) {
    console.error('[GET /api/finance/journal-entries]', err)
    return NextResponse.json({ error: 'Failed to load journal entries' }, { status: 500 })
  }
}

interface LineInput {
  accountId: string
  debit: number
  credit: number
  description?: string | null
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { date, description, reference, lines = [] } = body as {
      date: string
      description?: string
      reference?: string
      lines: LineInput[]
    }

    if (!Array.isArray(lines) || lines.length < 2) {
      return NextResponse.json(
        { error: 'At least 2 journal lines are required' },
        { status: 400 }
      )
    }

    const validLines = lines.filter(
      (l): l is LineInput => !!l.accountId && (l.debit > 0 || l.credit > 0)
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
        { error: 'Journal entry must balance' },
        { status: 400 }
      )
    }

    // Generate reference if not provided
    const ref = (reference ?? '').trim() || `JE-${Date.now().toString(36).toUpperCase()}`

    const entry = await prisma.$transaction(async (tx) => {
      const created = await tx.journalEntry.create({
        data: {
          reference: ref,
          description: description ?? null,
          date: date ? new Date(date) : new Date(),
          status: 'posted',
          lines: {
            create: validLines.map((l) => ({
              accountId: l.accountId,
              debit: l.debit ?? 0,
              credit: l.credit ?? 0,
              memo: l.description ?? null,
            })),
          },
        },
        include: {
          lines: {
            include: { account: true },
          },
        },
      })

      // Update account balances (debit increases, credit decreases raw balance)
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
    console.error('[POST /api/finance/journal-entries]', err)
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
