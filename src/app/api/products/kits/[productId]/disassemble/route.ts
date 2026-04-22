import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ productId: string }> },
) {
  const { productId } = await params
  const body = await req.json()
  const { quantity, storeId } = body

  if (!quantity || !storeId) {
    return NextResponse.json(
      { error: 'quantity and storeId are required' },
      { status: 400 },
    )
  }

  const kit = await prisma.productKit.findFirst({
    where: { productId },
    include: {
      components: {
        where: { isOptional: false },
        include: { component: { select: { id: true, name: true } } },
      },
    },
  })
  if (!kit) return NextResponse.json({ error: 'Kit not found' }, { status: 404 })

  const qty = Number(quantity)

  // Check kit inventory
  const kitInv = await prisma.inventory.findUnique({
    where: { productId_storeId: { productId, storeId } },
  })
  if (!kitInv || kitInv.quantity < qty) {
    return NextResponse.json(
      { error: `Insufficient kit inventory (available: ${kitInv?.quantity ?? 0})` },
      { status: 400 },
    )
  }

  // Execute all inventory mutations in a transaction
  await prisma.$transaction(async tx => {
    // Deduct kit inventory
    await tx.inventory.update({
      where: { productId_storeId: { productId, storeId } },
      data: { quantity: { decrement: qty } },
    })

    // Return component inventories
    for (const comp of kit.components) {
      const compQty = comp.quantity * qty
      const existing = await tx.inventory.findUnique({
        where: { productId_storeId: { productId: comp.productId, storeId } },
      })
      if (existing) {
        await tx.inventory.update({
          where: { productId_storeId: { productId: comp.productId, storeId } },
          data: { quantity: { increment: compQty } },
        })
      } else {
        await tx.inventory.create({
          data: {
            productId: comp.productId,
            storeId,
            quantity: compQty,
          },
        })
      }

      await tx.inventoryTransaction.create({
        data: {
          productId: comp.productId,
          storeId,
          type: 'kit_disassembly',
          quantity: compQty,
          beforeQty: existing?.quantity ?? 0,
          afterQty: (existing?.quantity ?? 0) + compQty,
          reference: `KIT-DISASM-${productId}`,
          notes: `Disassembled ${qty} x kit ${productId}`,
        },
      })
    }

    // Log kit deduction
    await tx.inventoryTransaction.create({
      data: {
        productId,
        storeId,
        type: 'kit_disassembly',
        quantity: -qty,
        beforeQty: kitInv.quantity,
        afterQty: kitInv.quantity - qty,
        reference: `KIT-DISASM-${productId}`,
        notes: `Kit disassembly — ${qty} unit(s) returned to components`,
      },
    })
  })

  return NextResponse.json({ success: true, disassembledQty: qty })
}
