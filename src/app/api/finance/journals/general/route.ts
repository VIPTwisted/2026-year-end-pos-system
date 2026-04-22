import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const batchId = searchParams.get('batchId')
  const type = searchParams.get('type') // e.g. CashReceipt

  if (batchId) {
    const batch = await prisma.generalJournalBatch.findUnique({
      where: { id: batchId },
      include: { lines: { orderBy: { lineNo: 'asc' } } },
    })
    if (!batch) return NextResponse.json({ error: 'Batch not found' }, { status: 404 })
    return NextResponse.json({ batch })
  }

  const where = type ? { batchType: type } : {}
  const batches = await prisma.generalJournalBatch.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: { _count: { select: { lines: true } } },
  })
  return NextResponse.json({ batches })
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { batchId, batchName, batchType, ...lineData } = body

  if (batchName) {
    const batch = await prisma.generalJournalBatch.create({
      data: { batchName, batchType: batchType ?? 'General', description: body.description ?? null },
    })
    return NextResponse.json({ batch }, { status: 201 })
  }

  if (batchId) {
    const batch = await prisma.generalJournalBatch.findUnique({
      where: { id: batchId },
      include: { _count: { select: { lines: true } } },
    })
    if (!batch) return NextResponse.json({ error: 'Batch not found' }, { status: 404 })
    if (batch.status === 'posted') return NextResponse.json({ error: 'Cannot add lines to a posted batch' }, { status: 400 })

    const lineNo = batch._count.lines + 1
    const line = await prisma.generalJournalBatchLine.create({
      data: {
        batchId,
        lineNo,
        postingDate: new Date(lineData.postingDate),
        documentType: lineData.documentType || null,
        accountType: lineData.accountType ?? 'GLAccount',
        accountNo: lineData.accountNo ?? null,
        description: lineData.description ?? null,
        debit: parseFloat(lineData.debit) || 0,
        credit: parseFloat(lineData.credit) || 0,
        balAccountType: lineData.balAccountType || null,
        balAccountNo: lineData.balAccountNo || null,
        currencyCode: lineData.currencyCode ?? 'USD',
        departmentCode: lineData.departmentCode || null,
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
      prisma.generalJournalBatch.update({ where: { id: batchId }, data: { status: 'posted' } }),
      prisma.generalJournalBatchLine.updateMany({ where: { batchId }, data: { status: 'posted' } }),
    ])
    return NextResponse.json({ ok: true })
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
}
