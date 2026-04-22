import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const { productName, problemType, description, severity, assignedTo } = body

  if (!problemType || !description) {
    return NextResponse.json({ error: 'problemType and description are required' }, { status: 400 })
  }

  const order = await prisma.qualityOrder.findUnique({ where: { id } })
  if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 })

  const lastNC = await prisma.nonConformance.findFirst({ orderBy: { createdAt: 'desc' } })
  let seq = 1
  if (lastNC) {
    const parts = lastNC.ncNumber.split('-')
    const n = parseInt(parts[1] ?? '0', 10)
    if (!isNaN(n)) seq = n + 1
  }
  const ncNumber = `NC-${String(seq).padStart(6, '0')}`

  const nc = await prisma.nonConformance.create({
    data: {
      ncNumber,
      orderId: id,
      productName: productName ?? order.productName,
      problemType,
      description,
      severity: severity ?? 'minor',
      status: 'open',
      assignedTo: assignedTo ?? null,
    },
    include: { correctiveActions: true },
  })

  return NextResponse.json(nc, { status: 201 })
}
