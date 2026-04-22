import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const search = searchParams.get('search')
    const itemId = searchParams.get('itemId')
    const locationCode = searchParams.get('locationCode')
    const dateFrom = searchParams.get('dateFrom')
    const dateTo = searchParams.get('dateTo')
    const entryType = searchParams.get('entryType')

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {}
    if (itemId) where.itemId = itemId
    if (locationCode) where.locationCode = locationCode
    if (entryType) where.entryType = entryType
    if (dateFrom || dateTo) {
      where.postingDate = {}
      if (dateFrom) where.postingDate.gte = new Date(dateFrom)
      if (dateTo) where.postingDate.lte = new Date(dateTo)
    }
    if (search) {
      where.OR = [
        { documentNo: { contains: search } },
        { itemNo: { contains: search } },
        { description: { contains: search } },
      ]
    }

    const entries = await prisma.itemLedgerEntry.findMany({
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
