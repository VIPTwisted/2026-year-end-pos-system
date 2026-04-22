import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status')
  const itemNo = searchParams.get('itemNo')

  const boms = await prisma.assemblyBOM.findMany({
    where: {
      ...(status ? { status } : {}),
      ...(itemNo ? { itemNo } : {}),
    },
    include: {
      _count: { select: { lines: true, orders: true } },
    },
    orderBy: { bomNo: 'asc' },
  })
  return NextResponse.json(boms)
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    // Auto-number: BOM-NNNN
    const last = await prisma.assemblyBOM.findFirst({
      where: { bomNo: { startsWith: 'BOM-' } },
      orderBy: { bomNo: 'desc' },
      select: { bomNo: true },
    })
    const seq = last ? parseInt(last.bomNo.slice(4)) + 1 : 1
    const bomNo = `BOM-${String(seq).padStart(4, '0')}`

    const bom = await prisma.assemblyBOM.create({
      data: {
        bomNo,
        itemNo: body.itemNo ?? null,
        description: body.description ?? null,
        unitOfMeasure: body.unitOfMeasure ?? 'EACH',
        versionCode: body.versionCode ?? '1',
        status: body.status ?? 'Certified',
        lines: body.lines && Array.isArray(body.lines)
          ? {
              create: body.lines.map((l: {
                lineNo?: number; type?: string; componentNo?: string;
                description?: string; qtyPer?: number; unitOfMeasure?: string; leadTimeDays?: number
              }) => ({
                lineNo: l.lineNo ?? 1,
                type: l.type ?? 'Item',
                componentNo: l.componentNo ?? null,
                description: l.description ?? null,
                qtyPer: l.qtyPer ?? 1,
                unitOfMeasure: l.unitOfMeasure ?? 'EACH',
                leadTimeDays: l.leadTimeDays ?? 0,
              })),
            }
          : undefined,
      },
      include: { lines: true, _count: { select: { lines: true, orders: true } } },
    })
    return NextResponse.json(bom, { status: 201 })
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Create failed' }, { status: 500 })
  }
}
