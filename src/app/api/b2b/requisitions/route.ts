import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

function genReqNumber() {
  return 'REQ-' + Math.floor(100000 + Math.random() * 900000)
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status') || ''
    const orgId = searchParams.get('orgId') || ''

    const reqs = await prisma.b2BRequisition.findMany({
      where: {
        ...(status ? { status } : {}),
        ...(orgId ? { orgId } : {}),
      },
      include: {
        org: { select: { id: true, name: true, accountNumber: true } },
        _count: { select: { lines: true, approvals: true } },
        approvals: { orderBy: { createdAt: 'desc' }, take: 1 },
      },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(reqs)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Failed to fetch requisitions' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { orgId, requestedBy, lines } = body

    if (!orgId) return NextResponse.json({ error: 'orgId required' }, { status: 400 })

    let reqNumber = genReqNumber()
    let attempts = 0
    while (attempts < 10) {
      const existing = await prisma.b2BRequisition.findUnique({ where: { reqNumber } })
      if (!existing) break
      reqNumber = genReqNumber()
      attempts++
    }

    const parsedLines: Array<{ productName: string; sku?: string; qty: number; unitPrice: number; notes?: string }> = lines ?? []
    const totalAmount = parsedLines.reduce((s, l) => s + (l.unitPrice ?? 0) * (l.qty ?? 1), 0)

    const req2 = await prisma.b2BRequisition.create({
      data: {
        reqNumber,
        orgId,
        requestedBy: requestedBy ?? null,
        totalAmount,
        status: 'draft',
        lines: {
          create: parsedLines.map((l) => ({
            productName: l.productName,
            sku: l.sku ?? null,
            qty: l.qty ?? 1,
            unitPrice: l.unitPrice ?? 0,
            lineTotal: (l.unitPrice ?? 0) * (l.qty ?? 1),
            notes: l.notes ?? null,
          })),
        },
      },
      include: { lines: true, org: true },
    })
    return NextResponse.json(req2, { status: 201 })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Failed to create requisition' }, { status: 500 })
  }
}
