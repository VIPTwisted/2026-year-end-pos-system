import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const sp = req.nextUrl.searchParams
    const supplierId = sp.get('supplierId')
    const status = sp.get('status')

    const returns = await prisma.vendorReturn.findMany({
      where: {
        ...(supplierId ? { supplierId } : {}),
        ...(status ? { status } : {}),
      },
      include: {
        supplier: { select: { id: true, name: true } },
        lines: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 200,
    })

    return NextResponse.json(returns)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

type CreateLineInput = {
  productId: string
  quantity: number
  unitCost: number
  notes?: string
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      supplierId: string
      reason: string
      items: CreateLineInput[]
      notes?: string
    }

    const { supplierId, reason, items, notes } = body

    if (!supplierId) {
      return NextResponse.json({ error: 'supplierId is required' }, { status: 400 })
    }
    if (!reason) {
      return NextResponse.json({ error: 'reason is required' }, { status: 400 })
    }
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'At least one item is required' }, { status: 400 })
    }

    const rtvNumber = `RTV-${Date.now().toString(36).toUpperCase()}`

    let totalAmount = 0
    const lines = items.map(item => {
      const qty = Number(item.quantity) || 0
      const cost = Number(item.unitCost) || 0
      const lineTotal = qty * cost
      totalAmount += lineTotal
      return {
        productId: item.productId,
        quantity: qty,
        unitCost: cost,
        lineTotal,
        notes: item.notes ?? null,
      }
    })

    const vendorReturn = await prisma.vendorReturn.create({
      data: {
        rtvNumber,
        supplierId,
        reason,
        notes: notes ?? null,
        totalAmount,
        status: 'draft',
        lines: { create: lines },
      },
      include: {
        supplier: true,
        lines: { include: { product: true } },
      },
    })

    return NextResponse.json(vendorReturn, { status: 201 })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
