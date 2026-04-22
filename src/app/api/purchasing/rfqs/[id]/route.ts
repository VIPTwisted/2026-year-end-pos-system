import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const rfq = await prisma.purchaseRFQ.findUnique({
    where: { id },
    include: {
      vendor: true,
      lines: { include: { product: { select: { id: true, name: true, sku: true } } } },
      quotes: {
        include: {
          vendor: true,
          lines: { include: { product: { select: { id: true, name: true, sku: true } } } },
        },
        orderBy: { totalAmount: 'asc' },
      },
    },
  })
  if (!rfq) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(rfq)
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const { status, responseDeadline, notes, vendorId } = body

  const rfq = await prisma.purchaseRFQ.update({
    where: { id },
    data: {
      ...(status ? { status } : {}),
      ...(responseDeadline !== undefined ? { responseDeadline: responseDeadline ? new Date(responseDeadline) : null } : {}),
      ...(notes !== undefined ? { notes } : {}),
      ...(vendorId !== undefined ? { vendorId } : {}),
    },
    include: {
      vendor: true,
      lines: { include: { product: true } },
      quotes: { include: { vendor: true, lines: true } },
    },
  })

  return NextResponse.json(rfq)
}
