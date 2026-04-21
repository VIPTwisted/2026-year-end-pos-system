import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const invoice = await prisma.customerInvoice.findUnique({
    where: { id },
    include: { customer: true },
  })

  if (!invoice) {
    return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
  }

  if (invoice.status !== 'draft') {
    return NextResponse.json(
      { error: `Cannot post invoice with status: ${invoice.status}` },
      { status: 400 }
    )
  }

  // Find AR account (code 1200 or first asset account)
  let arAccount = await prisma.account.findFirst({
    where: { code: '1200', isActive: true },
  })
  if (!arAccount) {
    arAccount = await prisma.account.findFirst({
      where: { type: 'asset', isActive: true },
      orderBy: { code: 'asc' },
    })
  }

  // Find Revenue account (code 4000 or first revenue account)
  let revenueAccount = await prisma.account.findFirst({
    where: { code: '4000', isActive: true },
  })
  if (!revenueAccount) {
    revenueAccount = await prisma.account.findFirst({
      where: { type: 'revenue', isActive: true },
      orderBy: { code: 'asc' },
    })
  }

  if (!arAccount || !revenueAccount) {
    return NextResponse.json(
      { error: 'Required GL accounts not found. Ensure accounts 1200 (AR) and 4000 (Revenue) exist.' },
      { status: 422 }
    )
  }

  // Create journal entry: debit AR, credit Revenue
  const journalEntry = await prisma.journalEntry.create({
    data: {
      reference: invoice.invoiceNumber,
      description: `AR Invoice posted: ${invoice.invoiceNumber} — ${invoice.customer.firstName} ${invoice.customer.lastName}`,
      date: new Date(),
      status: 'posted',
      lines: {
        create: [
          {
            accountId: arAccount.id,
            debit: invoice.totalAmount,
            credit: 0,
            memo: `AR: ${invoice.invoiceNumber}`,
          },
          {
            accountId: revenueAccount.id,
            debit: 0,
            credit: invoice.totalAmount,
            memo: `Revenue: ${invoice.invoiceNumber}`,
          },
        ],
      },
    },
  })

  // Update invoice to posted
  const updated = await prisma.customerInvoice.update({
    where: { id },
    data: {
      status: 'posted',
      postingDate: new Date(),
      journalEntryId: journalEntry.id,
    },
    include: { customer: true, lines: true, settlements: true },
  })

  return NextResponse.json(updated)
}
