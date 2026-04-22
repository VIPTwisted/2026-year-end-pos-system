import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status')
  const itemNo = searchParams.get('itemNo')

  const orders = await prisma.assemblyOrder.findMany({
    where: {
      ...(status ? { status } : {}),
      ...(itemNo ? { itemNo } : {}),
    },
    include: {
      bom: { select: { id: true, bomNo: true, versionCode: true } },
      lines: { orderBy: { lineNo: 'asc' } },
    },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(orders)
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    // Auto-number: ASM-YYYY-NNNN
    const year = new Date().getFullYear()
    const prefix = `ASM-${year}-`
    const last = await prisma.assemblyOrder.findFirst({
      where: { orderNo: { startsWith: prefix } },
      orderBy: { orderNo: 'desc' },
      select: { orderNo: true },
    })
    const seq = last ? parseInt(last.orderNo.slice(prefix.length)) + 1 : 1
    const orderNo = `${prefix}${String(seq).padStart(4, '0')}`

    const order = await prisma.assemblyOrder.create({
      data: {
        orderNo,
        itemNo: body.itemNo ?? null,
        description: body.description ?? null,
        qtyToAssemble: body.qtyToAssemble ?? 1,
        unitOfMeasure: body.unitOfMeasure ?? 'EACH',
        dueDate: body.dueDate ? new Date(body.dueDate) : null,
        locationCode: body.locationCode ?? null,
        bomId: body.bomId ?? null,
        bomVersionCode: body.bomVersionCode ?? '1',
        notes: body.notes ?? null,
        status: 'Open',
        lines: body.lines && Array.isArray(body.lines)
          ? {
              create: body.lines.map((l: {
                lineNo?: number; type?: string; componentNo?: string; description?: string;
                qtyPer?: number; quantity?: number; unitOfMeasure?: string; unitCost?: number
              }) => ({
                lineNo: l.lineNo ?? 1,
                type: l.type ?? 'Item',
                componentNo: l.componentNo ?? null,
                description: l.description ?? null,
                qtyPer: l.qtyPer ?? 1,
                quantity: l.quantity ?? l.qtyPer ?? 1,
                unitOfMeasure: l.unitOfMeasure ?? 'EACH',
                unitCost: l.unitCost ?? 0,
              })),
            }
          : undefined,
      },
      include: {
        bom: { select: { id: true, bomNo: true } },
        lines: { orderBy: { lineNo: 'asc' } },
      },
    })
    return NextResponse.json(order, { status: 201 })
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Create failed' }, { status: 500 })
  }
}
