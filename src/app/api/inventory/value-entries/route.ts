import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const itemId = searchParams.get('itemId')
    const dateFrom = searchParams.get('dateFrom')
    const dateTo = searchParams.get('dateTo')
    const entryType = searchParams.get('entryType')
    const itemLedgerEntryType = searchParams.get('itemLedgerEntryType')

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {}
    if (itemId) where.itemId = itemId
    if (entryType) where.entryType = entryType
    if (itemLedgerEntryType) where.itemLedgerEntryType = itemLedgerEntryType
    if (dateFrom || dateTo) {
      where.postingDate = {}
      if (dateFrom) where.postingDate.gte = new Date(dateFrom)
      if (dateTo) where.postingDate.lte = new Date(dateTo)
    }

    const entries = await prisma.valueEntry.findMany({
      where,
      orderBy: { entryNo: 'desc' },
      take: 500,
    })

    return NextResponse.json(entries)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
