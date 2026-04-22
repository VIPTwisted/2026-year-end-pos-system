import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')
    const accountId = searchParams.get('accountId')

    const where: Record<string, unknown> = {}
    if (status) where.status = status
    if (accountId) where.accountId = accountId

    const orders = await prisma.b2BOrder.findMany({
      where,
      include: {
        account: { select: { companyName: true, accountCode: true } },
        _count: { select: { lines: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(orders)
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to fetch B2B orders' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    if (!body.accountId) {
      return NextResponse.json({ error: 'accountId is required' }, { status: 400 })
    }

    const account = await prisma.b2BAccount.findUnique({ where: { id: body.accountId } })
    if (!account) {
      return NextResponse.json({ error: 'B2B account not found' }, { status: 404 })
    }

    const lines: Array<{
      productId?: string
      productName?: string
      sku?: string
      qty: number
      unitPrice: number
      discountPct?: number
    }> = body.lines || []

    const subtotal = lines.reduce((sum, l) => {
      const disc = (l.discountPct ?? 0) / 100
      return sum + l.qty * l.unitPrice * (1 - disc)
    }, 0)
    const discountAmt = body.discountAmt ?? 0
    const taxAmt = body.taxAmt ?? 0
    const totalAmt = subtotal - discountAmt + taxAmt

    const order = await prisma.b2BOrder.create({
      data: {
        accountId: body.accountId,
        status: 'pending',
        requestedDate: body.requestedDate ? new Date(body.requestedDate) : null,
        poReference: body.poReference || null,
        subtotal,
        discountAmt,
        taxAmt,
        totalAmt,
        notes: body.notes || null,
        lines: {
          create: lines.map((l) => ({
            productId: l.productId || null,
            productName: l.productName || null,
            sku: l.sku || null,
            qty: l.qty,
            unitPrice: l.unitPrice,
            discountPct: l.discountPct ?? 0,
            lineTotal: l.qty * l.unitPrice * (1 - (l.discountPct ?? 0) / 100),
          })),
        },
      },
      include: { lines: true, account: true },
    })

    return NextResponse.json(order, { status: 201 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to create B2B order' }, { status: 500 })
  }
}
