import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const search   = searchParams.get('search')   ?? ''
    const vendorId = searchParams.get('vendorId') ?? ''
    const dateFrom = searchParams.get('dateFrom') ?? ''
    const dateTo   = searchParams.get('dateTo')   ?? ''

    type WhereClause = {
      OR?: { receiptNumber?: { contains: string } }[]
      po?: { vendorId?: string }
      receivedAt?: { gte?: Date; lte?: Date }
    }

    const where: WhereClause = {}

    if (search) {
      where.OR = [{ receiptNumber: { contains: search } }]
    }
    if (vendorId) {
      where.po = { vendorId }
    }
    if (dateFrom || dateTo) {
      where.receivedAt = {}
      if (dateFrom) where.receivedAt.gte = new Date(dateFrom)
      if (dateTo)   where.receivedAt.lte = new Date(dateTo)
    }

    const receipts = await prisma.vendorReceipt.findMany({
      where,
      include: {
        po: {
          select: {
            id:       true,
            poNumber: true,
            vendor:   { select: { id: true, vendorCode: true, name: true } },
          },
        },
        lines: true,
      },
      orderBy: { receivedAt: 'desc' },
      take: 500,
    })

    return NextResponse.json(receipts)
  } catch (err) {
    console.error('[GET /api/purchase/receipts]', err)
    return NextResponse.json({ error: 'Failed to fetch receipts', detail: String(err) }, { status: 500 })
  }
}
