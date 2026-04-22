import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const order = await prisma.salesReturnOrder.findUnique({
      where: { id: params.id },
      include: { lines: true },
    })
    if (!order) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(order)
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json()
    const { lines, action, ...rest } = body

    // Handle status actions
    if (action === 'release') {
      const updated = await prisma.salesReturnOrder.update({
        where: { id: params.id },
        data: { status: 'Released' },
      })
      return NextResponse.json(updated)
    }
    if (action === 'post') {
      const updated = await prisma.salesReturnOrder.update({
        where: { id: params.id },
        data: { status: 'Posted' },
      })
      return NextResponse.json(updated)
    }

    // Full update
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data: any = { ...rest }
    if (rest.returnDate) data.returnDate = new Date(rest.returnDate)
    if (rest.postingDate) data.postingDate = new Date(rest.postingDate)

    if (lines) {
      data.lines = {
        deleteMany: {},
        create: lines.map((l: Record<string, unknown>) => ({
          lineType: String(l.lineType ?? 'Item'),
          itemNo: String(l.itemNo ?? ''),
          description: String(l.description ?? ''),
          quantity: Number(l.quantity ?? 1),
          unitPrice: Number(l.unitPrice ?? 0),
          lineTotal: Number(l.lineTotal ?? 0),
        })),
      }
    }

    const updated = await prisma.salesReturnOrder.update({
      where: { id: params.id },
      data,
      include: { lines: true },
    })
    return NextResponse.json(updated)
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.salesReturnOrder.delete({ where: { id: params.id } })
    return NextResponse.json({ success: true })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
