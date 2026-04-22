import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// Purchase Credit Memos — backed by VendorInvoice with status='credit-memo'
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const search   = searchParams.get('search')   ?? ''
    const vendorId = searchParams.get('vendorId') ?? ''
    const dateFrom = searchParams.get('dateFrom') ?? ''
    const dateTo   = searchParams.get('dateTo')   ?? ''

    type WhereClause = {
      status: string
      OR?: { invoiceNumber?: { contains: string }; notes?: { contains: string } }[]
      vendorId?: string
      invoiceDate?: { gte?: Date; lte?: Date }
    }

    const where: WhereClause = { status: 'credit-memo' }

    if (search) {
      where.OR = [
        { invoiceNumber: { contains: search } },
        { notes:         { contains: search } },
      ]
    }
    if (vendorId) where.vendorId = vendorId
    if (dateFrom || dateTo) {
      where.invoiceDate = {}
      if (dateFrom) where.invoiceDate.gte = new Date(dateFrom)
      if (dateTo)   where.invoiceDate.lte = new Date(dateTo)
    }

    const memos = await prisma.vendorInvoice.findMany({
      where,
      include: {
        vendor: { select: { id: true, vendorCode: true, name: true } },
        lines:  true,
      },
      orderBy: { invoiceDate: 'desc' },
      take: 500,
    })

    return NextResponse.json(memos)
  } catch (err) {
    console.error('[GET /api/purchase/credit-memos]', err)
    return NextResponse.json({ error: 'Failed to fetch credit memos', detail: String(err) }, { status: 500 })
  }
}
