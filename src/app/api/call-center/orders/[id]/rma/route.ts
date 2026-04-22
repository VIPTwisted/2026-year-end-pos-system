import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

function generateRmaNumber(): string {
  return `RMA-${Math.floor(100000 + Math.random() * 900000)}`
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const rmas = await prisma.callCenterRMA.findMany({ where: { orderId: id }, orderBy: { createdAt: 'desc' } })
  return NextResponse.json(rmas)
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const order = await prisma.callCenterOrder.findUnique({ where: { id } })
  if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 })
  let rmaNumber = generateRmaNumber()
  for (let i = 0; i < 10; i++) {
    const existing = await prisma.callCenterRMA.findUnique({ where: { rmaNumber } })
    if (!existing) break
    rmaNumber = generateRmaNumber()
  }
  const rma = await prisma.callCenterRMA.create({
    data: {
      orderId: id, rmaNumber,
      reason: body.reason ?? 'damaged',
      disposition: body.disposition ?? 'refund',
      status: 'pending',
      refundAmount: body.refundAmount ?? 0,
      items: body.items ? JSON.stringify(body.items) : '[]',
      notes: body.notes,
    },
  })
  return NextResponse.json(rma, { status: 201 })
}
