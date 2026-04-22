import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await req.json()

    const order = await prisma.serviceOrder.findUnique({ where: { id } })
    if (!order) {
      return NextResponse.json({ error: 'Service order not found' }, { status: 404 })
    }

    const { productId, partName, partNo, quantity, unitCost } = body

    if (!partName) {
      return NextResponse.json({ error: 'partName is required' }, { status: 400 })
    }

    const qty = parseInt(String(quantity ?? 1))
    const cost = parseFloat(String(unitCost ?? 0))
    const lineTotal = qty * cost

    const part = await prisma.serviceOrderPart.create({
      data: {
        serviceOrderId: id,
        productId: productId || null,
        partName,
        partNo: partNo || null,
        quantity: qty,
        unitCost: cost,
        totalCost: lineTotal,
      },
      include: {
        product: { select: { id: true, name: true, sku: true } },
      },
    })

    // Recalculate partsCost and totalCost on the service order
    const allParts = await prisma.serviceOrderPart.findMany({
      where: { serviceOrderId: id },
    })
    const newPartsCost = allParts.reduce(
      (sum, p) => sum + parseFloat(String(p.totalCost)),
      0
    )
    const laborCost = parseFloat(String(order.laborCost))
    await prisma.serviceOrder.update({
      where: { id },
      data: {
        partsCost: newPartsCost,
        totalCost: laborCost + newPartsCost,
      },
    })

    return NextResponse.json(part, { status: 201 })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
