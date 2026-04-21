import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

interface Context {
  params: Promise<{ id: string }>
}

export async function POST(_req: Request, { params }: Context) {
  try {
    const { id } = await params

    const period = await prisma.payrollPeriod.findUnique({
      where: { id },
      include: { entries: true },
    })

    if (!period) {
      return NextResponse.json({ error: 'Payroll period not found' }, { status: 404 })
    }

    if (period.entries.length === 0) {
      return NextResponse.json({ error: 'No entries to post' }, { status: 400 })
    }

    // Reject if any draft entries remain
    const draftCount = period.entries.filter(e => e.status === 'draft').length
    if (draftCount > 0) {
      return NextResponse.json(
        { error: `${draftCount} entries still in draft status. Approve all entries before posting.` },
        { status: 400 }
      )
    }

    const totalNetPay = period.entries.reduce((s, e) => s + e.netPay, 0)
    const totalGross  = period.entries.reduce((s, e) => s + e.grossPay, 0)

    // Resolve GL accounts — prefer code-specific, fall back to first matching type
    const salariesAccount = await prisma.account.findFirst({
      where: { OR: [{ code: '5100' }, { type: 'expense' }] },
      orderBy: { code: 'asc' },
    })
    const cashAccount = await prisma.account.findFirst({
      where: { OR: [{ code: '1010' }, { type: 'asset', subtype: 'current' }] },
      orderBy: { code: 'asc' },
    })

    // Create journal entry
    const je = await prisma.journalEntry.create({
      data: {
        reference: `PAY-${period.id.slice(-8).toUpperCase()}`,
        description: `Payroll post: ${period.name}`,
        date: new Date(period.payDate),
        lines: {
          create: [
            ...(salariesAccount
              ? [{ accountId: salariesAccount.id, debit: totalGross, credit: 0, memo: `Salaries expense — ${period.name}` }]
              : []),
            ...(cashAccount
              ? [{ accountId: cashAccount.id, debit: 0, credit: totalNetPay, memo: `Net payroll disbursement — ${period.name}` }]
              : []),
          ],
        },
      },
    })

    // Update all approved entries → paid, stamp journalEntryId
    await prisma.payrollEntry.updateMany({
      where: { periodId: id, status: 'approved' },
      data: { status: 'paid', journalEntryId: je.id },
    })

    // Update period → posted
    const updated = await prisma.payrollPeriod.update({
      where: { id },
      data: { status: 'posted' },
    })

    return NextResponse.json({
      period: updated,
      journalEntryId: je.id,
      totalNetPay,
      entriesPosted: period.entries.length,
    })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to post payroll' }, { status: 500 })
  }
}
