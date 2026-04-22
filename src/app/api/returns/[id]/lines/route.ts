import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const lines = await prisma.returnLine.findMany({
    where: { returnAuthorizationId: id },
    orderBy: { createdAt: 'asc' },
  })
  return NextResponse.json(lines)
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const ra = await prisma.returnAuthorization.findUnique({ where: { id } })
    if (!ra) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    if (ra.status !== 'pending') {
      return NextResponse.json(
        { error: 'Cannot add lines to a non-pending RA' },
        { status: 400 }
      )
    }

    const body = await req.json()
    const line = await prisma.returnLine.create({
      data: {
        returnAuthorizationId: id,
        productId: body.productId ?? null,
        productName: body.productName ?? null,
        sku: body.sku ?? null,
        qtyRequested: Number(body.qtyRequested) || 1,
        unitPrice: Number(body.unitPrice) || 0,
        returnReason: body.returnReason ?? null,
      },
    })
    return NextResponse.json(line, { status: 201 })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
