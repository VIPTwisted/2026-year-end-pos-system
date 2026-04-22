import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')

    const where: Record<string, unknown> = { vendorId: id }
    if (status) where.status = status

    const pos = await prisma.vendorPO.findMany({
      where,
      include: {
        _count: { select: { lines: true } },
        vendor: { select: { name: true, vendorCode: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(pos)
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to fetch POs' }, { status: 500 })
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await req.json()

    const vendor = await prisma.vendor.findUnique({ where: { id } })
    if (!vendor) {
      return NextResponse.json({ error: 'Vendor not found' }, { status: 404 })
    }

    const lines: Array<{
      productId?: string
      productName?: string
      sku?: string
      qtyOrdered: number
      unitCost: number
    }> = body.lines || []

    const subtotal = lines.reduce((sum: number, l) => sum + l.qtyOrdered * l.unitCost, 0)
    const taxAmt = body.taxAmt ?? 0
    const shippingAmt = body.shippingAmt ?? 0
    const totalAmt = subtotal + taxAmt + shippingAmt

    const po = await prisma.vendorPO.create({
      data: {
        vendorId: id,
        status: 'draft',
        expectedDate: body.expectedDate ? new Date(body.expectedDate) : null,
        shippingAddress: body.shippingAddress || null,
        subtotal,
        taxAmt,
        shippingAmt,
        totalAmt,
        notes: body.notes || null,
        lines: {
          create: lines.map((l) => ({
            productId: l.productId || null,
            productName: l.productName || null,
            sku: l.sku || null,
            qtyOrdered: l.qtyOrdered,
            unitCost: l.unitCost,
            lineTotal: l.qtyOrdered * l.unitCost,
          })),
        },
      },
      include: { lines: true, vendor: true },
    })

    return NextResponse.json(po, { status: 201 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to create PO' }, { status: 500 })
  }
}
