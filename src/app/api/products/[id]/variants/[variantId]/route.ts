import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

type Ctx = { params: Promise<{ id: string; variantId: string }> }

export async function GET(_: NextRequest, { params }: Ctx) {
  try {
    const { variantId } = await params
    const variant = await prisma.productVariant.findUnique({
      where: { id: variantId },
      include: {
        attributes: {
          include: {
            attributeValue: true,
          },
        },
        inventoryItems: {
          include: { store: { select: { id: true, name: true } } },
        },
      },
    })
    if (!variant) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(variant)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest, { params }: Ctx) {
  try {
    const { variantId } = await params
    const body = await req.json() as {
      sku?: string
      barcode?: string
      variantCode?: string
      description?: string
      priceOffset?: number
      costOffset?: number
      isActive?: boolean
      inventoryUpdates?: { storeId: string; quantity: number }[]
    }

    // Update core variant fields
    const allowedFields = ['sku', 'barcode', 'variantCode', 'description', 'priceOffset', 'costOffset', 'isActive']
    const data = Object.fromEntries(
      Object.entries(body).filter(([k]) => allowedFields.includes(k))
    )

    const variant = await prisma.productVariant.update({
      where: { id: variantId },
      data,
      include: {
        attributes: {
          include: { attributeValue: true },
        },
        inventoryItems: {
          include: { store: { select: { id: true, name: true } } },
        },
      },
    })

    // Handle inventory quantity updates
    if (body.inventoryUpdates && body.inventoryUpdates.length > 0) {
      await Promise.all(
        body.inventoryUpdates.map(({ storeId, quantity }) =>
          prisma.inventory.updateMany({
            where: { variantId, storeId },
            data: { quantity },
          })
        )
      )
    }

    return NextResponse.json(variant)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(_: NextRequest, { params }: Ctx) {
  try {
    const { variantId } = await params
    // Soft-delete: set isActive = false
    const variant = await prisma.productVariant.update({
      where: { id: variantId },
      data: { isActive: false },
    })
    return NextResponse.json(variant)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
