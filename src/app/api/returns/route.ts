import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

function genRANumber() {
  return `RA-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 5).toUpperCase()}`
}

export async function GET(req: NextRequest) {
  const status = req.nextUrl.searchParams.get('status') ?? ''
  const search = req.nextUrl.searchParams.get('search') ?? ''

  const returns = await prisma.returnAuthorization.findMany({
    where: {
      ...(status ? { status } : {}),
      ...(search
        ? {
            OR: [
              { raNumber: { contains: search } },
              { customerName: { contains: search } },
              { customerEmail: { contains: search } },
              { orderNumber: { contains: search } },
            ],
          }
        : {}),
    },
    include: {
      lines: true,
      inspection: true,
      refundRecord: true,
    },
    orderBy: { createdAt: 'desc' },
    take: 200,
  })
  return NextResponse.json(returns)
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { lines, ...raData } = body

    const ra = await prisma.returnAuthorization.create({
      data: {
        ...raData,
        raNumber: genRANumber(),
        lines: lines?.length
          ? {
              create: lines.map((l: Record<string, unknown>) => ({
                productId: l.productId ?? null,
                productName: l.productName ?? null,
                sku: l.sku ?? null,
                qtyRequested: Number(l.qtyRequested) || 1,
                unitPrice: Number(l.unitPrice) || 0,
                returnReason: l.returnReason ?? null,
              })),
            }
          : undefined,
      },
      include: {
        lines: true,
        inspection: true,
        refundRecord: true,
      },
    })
    return NextResponse.json(ra, { status: 201 })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
