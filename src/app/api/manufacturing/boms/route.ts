import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status')
  const boms = await prisma.productionBOM.findMany({
    where: status ? { status } : undefined,
    orderBy: { createdAt: 'desc' },
    include: {
      outputProduct: { select: { id: true, name: true, sku: true } },
      _count: { select: { lines: true } },
    },
  })
  return NextResponse.json(boms)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  if (!body.description?.trim()) {
    return NextResponse.json({ error: 'description is required' }, { status: 400 })
  }
  // Generate BOM number
  const count = await prisma.productionBOM.count()
  const bomNumber = `BOM-${String(count + 1).padStart(4, '0')}`

  const bom = await prisma.productionBOM.create({
    data: {
      bomNumber,
      description: body.description.trim(),
      unitOfMeasure: body.unitOfMeasure?.trim() || 'EACH',
      status: 'new',
      outputProductId: body.outputProductId || null,
      lines: body.lines?.length
        ? {
            create: (body.lines as Array<{
              componentProductId: string
              lineNo?: number
              quantity: number
              unitOfMeasure?: string
              scrapPct?: number
              type?: string
            }>).map((l, i) => ({
              lineNo: l.lineNo ?? i + 1,
              componentProductId: l.componentProductId,
              quantity: Number(l.quantity),
              unitOfMeasure: l.unitOfMeasure || 'EACH',
              scrapPct: Number(l.scrapPct ?? 0),
              type: l.type || 'item',
            })),
          }
        : undefined,
    },
    include: {
      outputProduct: { select: { id: true, name: true, sku: true } },
      lines: { include: { component: { select: { id: true, name: true, sku: true } } } },
    },
  })
  return NextResponse.json(bom, { status: 201 })
}
