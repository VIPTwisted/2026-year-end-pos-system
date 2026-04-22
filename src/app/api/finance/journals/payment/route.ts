import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const batchId = searchParams.get('batchId')

  if (batchId) {
    // Return single batch with lines
    const batch = await prisma.paymentJournalBatch.findUnique({
      where: { id: batchId },
      include: { lines: { orderBy: { lineNo: 'asc' } } },
    })
    if (!batch) return NextResponse.json({ error: 'Batch not found' }, { status: 404 })
    return NextResponse.json({ batch })
  }

  // Return all batches with line counts
  const batches = await prisma.paymentJournalBatch.findMany({
    orderBy: { createdAt: 'desc' },
    include: { _count: { select: { lines: true } } },
  })
  return NextResponse.json({ batches })
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { batchId, batchName, batchType, ...lineData } = body

  // Creating a new batch
  if (batchName) {
    const batch = await prisma.paymentJournalBatch.create({
      data: { batchName, batchType: batchType ?? 'Payment', description: body.description ?? null },
    })
    return NextResponse.json({ batch }, { status: 201 })
  }

  // Adding a line to existing batch
  if (batchId) {
    const batch = await prisma.paymentJournalBatch.findUnique({
      where: { id: batchId },
      include: { _count: { select: { lines: true } } },
    })
    if (!batch) return NextResponse.json({ error: 'Batch not found' }, { status: 404 })
    if (batch.status === 'posted') return NextResponse.json({ error: 'Cannot add lines to a posted batch' }, { status: 400 })

    const lineNo = batch._count.lines + 1
    const line = await prisma.paymentJournalLine.create({
      data: {
        batchId,
        lineNo,
        postingDate: new Date(lineData.postingDate),
        documentType: lineData.documentType ?? 'Payment',
        accountType: lineData.accountType ?? 'Vendor',
        accountNo: lineData.accountNo ?? null,
        appliesToDocType: lineData.appliesToDocType ?? null,
        appliesToDocNo: lineData.appliesToDocNo ?? null,
        description: lineData.description ?? null,
        amount: parseFloat(lineData.amount) || 0,
        balAccountType: lineData.balAccountType ?? 'Bank',
        balAccountNo: lineData.balAccountNo ?? null,
        currencyCode: lineData.currencyCode ?? 'USD',
      },
    })
    return NextResponse.json({ line }, { status: 201 })
  }

  return NextResponse.json({ error: 'batchId or batchName required' }, { status: 400 })
}

export async function PATCH(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const batchId = searchParams.get('batchId')
  const body = await req.json()

  if (!batchId) return NextResponse.json({ error: 'batchId required' }, { status: 400 })

  if (body.action === 'post') {
    await prisma.$transaction([
      prisma.paymentJournalBatch.update({ where: { id: batchId }, data: { status: 'posted' } }),
      prisma.paymentJournalLine.updateMany({ where: { batchId }, data: { status: 'posted' } }),
    ])
    return NextResponse.json({ ok: true })
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
}
