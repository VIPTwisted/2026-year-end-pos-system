import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

interface PORequestItem {
  productId: string
  supplierId: string
  qty: number
  unitCost: number
}

interface PORequestBody {
  items: PORequestItem[]
}

interface CreatedPO {
  id: string
  poNumber: string
  supplierId: string
  supplierName: string
  itemCount: number
  totalAmount: number
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as PORequestBody

    if (!body.items || !Array.isArray(body.items) || body.items.length === 0) {
      return NextResponse.json({ error: 'No items provided' }, { status: 400 })
    }

    // Get the first active store to attach the POs to
    const store = await prisma.store.findFirst({
      where: { isActive: true },
      orderBy: { createdAt: 'asc' },
    })

    if (!store) {
      return NextResponse.json({ error: 'No active store found' }, { status: 400 })
    }

    // Group items by supplierId
    const grouped = new Map<string, PORequestItem[]>()
    for (const item of body.items) {
      if (!item.supplierId) continue
      const existing = grouped.get(item.supplierId) ?? []
      existing.push(item)
      grouped.set(item.supplierId, existing)
    }

    if (grouped.size === 0) {
      return NextResponse.json({ error: 'No items with valid supplierId' }, { status: 400 })
    }

    // Fetch supplier names
    const supplierIds = Array.from(grouped.keys())
    const suppliers = await prisma.supplier.findMany({
      where: { id: { in: supplierIds } },
    })
    const supplierMap = new Map(suppliers.map(s => [s.id, s.name]))

    // Fetch product info for productName and sku
    const productIds = body.items.map(i => i.productId)
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, name: true, sku: true },
    })
    const productMap = new Map(products.map(p => [p.id, p]))

    const createdPOs: CreatedPO[] = []

    for (const [supplierId, items] of grouped.entries()) {
      const poNumber = `PO-${Date.now().toString(36).toUpperCase()}-${supplierId.slice(-4).toUpperCase()}`
      const totalAmount = items.reduce((sum, i) => sum + i.qty * i.unitCost, 0)

      const po = await prisma.purchaseOrder.create({
        data: {
          poNumber,
          supplierId,
          storeId: store.id,
          status: 'draft',
          subtotal: totalAmount,
          taxAmount: 0,
          shippingCost: 0,
          totalAmount,
          items: {
            create: items.map(item => {
              const product = productMap.get(item.productId)
              return {
                productId: item.productId,
                productName: product?.name ?? 'Unknown Product',
                sku: product?.sku ?? '',
                orderedQty: item.qty,
                receivedQty: 0,
                unitCost: item.unitCost,
                lineTotal: item.qty * item.unitCost,
              }
            }),
          },
        },
      })

      createdPOs.push({
        id: po.id,
        poNumber: po.poNumber,
        supplierId,
        supplierName: supplierMap.get(supplierId) ?? 'Unknown Supplier',
        itemCount: items.length,
        totalAmount,
      })

      // Small delay to ensure unique timestamps in poNumber when processing multiple suppliers
      await new Promise(r => setTimeout(r, 5))
    }

    return NextResponse.json({ purchaseOrders: createdPOs }, { status: 201 })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
