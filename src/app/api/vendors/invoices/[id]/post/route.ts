import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  // Load the invoice
  const invoice = await prisma.vendorInvoice.findUnique({
    where: { id },
    include: { vendor: true },
  })

  if (!invoice) {
    return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
  }

  if (invoice.status !== 'draft') {
    return NextResponse.json(
      { error: `Invoice is already "${invoice.status}" and cannot be posted` },
      { status: 409 }
    )
  }

  // Resolve GL accounts — prefer exact codes, fall back to first account of matching type
  const [expenseAccount, apAccount] = await Promise.all([
    prisma.account.findUnique({ where: { code: '5000' } }).then(
      a => a ?? prisma.account.findFirst({ where: { type: 'expense', isActive: true } })
    ),
    prisma.account.findUnique({ where: { code: '2000' } }).then(
      a => a ?? prisma.account.findFirst({ where: { type: 'liability', isActive: true } })
    ),
  ])

  if (!expenseAccount || !apAccount) {
    return NextResponse.json(
      { error: 'Cannot post: no expense or AP liability account found in chart of accounts' },
      { status: 422 }
    )
  }

  // Create journal entry + update invoice in a transaction
  const updatedInvoice = await prisma.$transaction(async tx => {
    const journalEntry = await tx.journalEntry.create({
      data: {
        reference:   invoice.invoiceNumber,
        description: `Vendor invoice posted — ${invoice.vendor.name}`,
        date:        new Date(),
        status:      'posted',
        lines: {
          create: [
            {
              accountId: expenseAccount.id,
              debit:     invoice.totalAmount,
              credit:    0,
              memo:      `Expense — ${invoice.invoiceNumber}`,
            },
            {
              accountId: apAccount.id,
              debit:     0,
              credit:    invoice.totalAmount,
              memo:      `AP — ${invoice.invoiceNumber}`,
            },
          ],
        },
      },
    })

    // Update account balances
    await tx.account.update({
      where: { id: expenseAccount.id },
      data:  { balance: { increment: invoice.totalAmount } },
    })
    await tx.account.update({
      where: { id: apAccount.id },
      data:  { balance: { increment: invoice.totalAmount } },
    })

    // Update invoice status → posted
    return tx.vendorInvoice.update({
      where: { id },
      data: {
        status:         'posted',
        journalEntryId: journalEntry.id,
        postingDate:    new Date(),
      },
      include: { vendor: true, lines: true },
    })
  })

  return NextResponse.json(updatedInvoice)
}
