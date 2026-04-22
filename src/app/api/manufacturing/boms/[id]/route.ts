import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const bom = await prisma.productionBOM.findUnique({
    where: { id },
    include: {
      outputProduct: { select: { id: true, name: true, sku: true } },
      lines: {
        include: { component: { select: { id: true, name: true, sku: true, unit: true } } },
        orderBy: { lineNo: 'asc' },
      },
    },
  })
  if (!bom) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(bom)
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const allowed = ['description', 'unitOfMeasure', 'status', 'outputProductId']
  const data: Record<string, unknown> = {}
  for (const key of allowed) {
    if (key in body) data[key] = body[key]
  }
  // Status transition guard
  const current = await prisma.productionBOM.findUnique({ where: { id }, select: { status: true } })
  if (!current) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (data.status === 'certified' && current.status === 'closed') {
    return NextResponse.json({ error: 'Closed BOMs cannot be re-certified' }, { status: 400 })
  }
  const bom = await prisma.productionBOM.update({ where: { id }, data })
  return NextResponse.json(bom)
}
