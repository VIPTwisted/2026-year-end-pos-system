import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const itemNo      = searchParams.get('itemNo')
    const entryType   = searchParams.get('entryType')
    const locationCode = searchParams.get('locationCode')
    const dateFrom    = searchParams.get('dateFrom')
    const dateTo      = searchParams.get('dateTo')

    const entries = await prisma.itemLedgerEntry.findMany({
      where: {
        ...(itemNo       ? { itemNo } : {}),
        ...(entryType    ? { entryType } : {}),
        ...(locationCode ? { locationCode } : {}),
        ...(dateFrom || dateTo ? {
          postingDate: {
            ...(dateFrom ? { gte: new Date(dateFrom) } : {}),
            ...(dateTo   ? { lte: new Date(dateTo)   } : {}),
          },
        } : {}),
      },
      orderBy: { postingDate: 'desc' },
      take: 1000,
    })
    return NextResponse.json(entries)
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
