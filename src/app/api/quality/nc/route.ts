import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status')
  const severity = searchParams.get('severity')

  const ncs = await prisma.nonConformance.findMany({
    where: {
      ...(status && status !== 'all' ? { status } : {}),
      ...(severity ? { severity } : {}),
    },
    include: {
      correctiveActions: true,
      order: { select: { id: true, orderNumber: true, productName: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 200,
  })

  return NextResponse.json(ncs)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { productName, problemType, description, severity, assignedTo } = body

  if (!problemType || !description) {
    return NextResponse.json({ error: 'problemType and description are required' }, { status: 400 })
  }

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
      productName: productName ?? null,
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
